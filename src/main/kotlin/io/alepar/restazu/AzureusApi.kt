package io.alepar.restazu

import io.javalin.UploadedFile
import org.gudy.azureus2.plugins.PluginConfig
import org.gudy.azureus2.plugins.PluginInterface
import org.gudy.azureus2.plugins.disk.DiskManagerEvent
import org.gudy.azureus2.plugins.disk.DiskManagerFileInfo
import org.gudy.azureus2.plugins.disk.DiskManagerRequest
import org.gudy.azureus2.plugins.download.Download
import java.io.ByteArrayOutputStream
import java.net.URLEncoder
import java.nio.file.Files
import javax.servlet.http.HttpServletResponse
import java.nio.channels.Channels
import java.nio.charset.StandardCharsets
import java.util.concurrent.atomic.AtomicBoolean


interface AzureusApi {

    fun getDownloads() : Map<String, RestDownload>;

    fun getDownloadFiles() : Map<String, Map<Int, RestDownloadFile>>;

    fun getSpeedLimits() : RestSpeedLimits;

    fun upload(uploadedFiles: List<UploadedFile>)
    fun sendFile(hash: String, idx: Int, response: HttpServletResponse, range: AzureusRestApi.Range? = null)
    fun findDownload(hash: String): Download?
}

class PluginInterfaceAzureusApi(iface: PluginInterface) : AzureusApi {

    private val downloadManager = iface.downloadManager
    private val config = iface.pluginconfig
    private val utilities = iface.utilities
    private val torrentManager = iface.torrentManager

    override fun upload(uploadedFiles: List<UploadedFile>) {
        uploadedFiles.forEach { file ->
            val baos = ByteArrayOutputStream()
            file.content.copyTo(baos)
            val torrent = torrentManager.createFromBEncodedData(baos.toByteArray())

            downloadManager.addDownload(torrent)
        }
    }

    override fun getDownloads(): Map<String, RestDownload> {
        return downloadManager.downloads
                .map { download ->
                        val torrent = download.torrent
                        val stats = download.stats
                        val peerStats = download.peerManager?.stats
                        val lastScrape = download.lastScrapeResult

                        RestDownload(
                                bytesToHex(torrent.hash),
                                download.name,
                                stats.status,
                                torrent.size,
                                torrent.comment,
                                torrent.size-stats.remainingExcludingDND,
                                stats.uploaded,
                                stats.downloadAverage,
                                stats.uploadAverage,
                                stats.etaSecs,
                                peerStats?.connectedLeechers,
                                peerStats?.connectedSeeds,
                                lastScrape?.nonSeedCount,
                                lastScrape?.seedCount,
                                download.creationTime
                        )
                    }
                .associateBy ({ it.hash }, { it })
    }

    override fun getDownloadFiles(): Map<String, Map<Int, RestDownloadFile>> {
        return downloadManager.downloads
                .associateBy(
                        { bytesToHex(it.torrent.hash) },
                        { download ->
                            download.diskManagerFileInfo.associateBy(
                                { it.index },
                                { file ->
                                    RestDownloadFile(
                                            file.index,
                                            extractTorrentFileName(download, file), // torrent.files[it.index].name is *very* slow
                                            file.length,
                                            file.downloaded,
                                            extractPriority(file)
                                    )
                                }
                            )

                        }
                );
    }

    override fun getSpeedLimits(): RestSpeedLimits {
        return RestSpeedLimits(
                config.getCoreIntParameter( PluginConfig.CORE_PARAM_INT_MAX_DOWNLOAD_SPEED_KBYTES_PER_SEC ),
                config.getCoreIntParameter( PluginConfig.CORE_PARAM_INT_MAX_UPLOAD_SPEED_KBYTES_PER_SEC )
        );
    }

    override fun sendFile(hash: String, idx: Int, response: HttpServletResponse, range: AzureusRestApi.Range?) {
        val download = this.findDownload(hash)

        if (download == null) {
            response.status = 404
        } else {
            val fileInfo = download.getDiskManagerFileInfo(idx)
            val file = fileInfo.file

            val contentDisposition = "attachment; filename=${URLEncoder.encode(file.name, StandardCharsets.UTF_8.name())}";
            var contentType = Files.probeContentType(file.toPath())
            if (contentType == null) contentType = "application/octet-stream"

            var start = 0L
            var end = fileInfo.length-1
            if (range != null) {
                if (range.start != null) {
                    start = range.start
                }
                if (range.end != null) {
                    end = range.end
                }
            }
            val length = end-start+1

            with(response) {
                setHeader("Content-Type", contentType)
                setHeader("Content-Disposition", contentDisposition)

                setHeader("Content-Length", length.toString())
                if (range == null) {
                    status = 200
                } else {
                    status = 206
                    val contentRange = "bytes ${start}-${end}/${fileInfo.length}"
                    setHeader("Content-Range", contentRange)
                }
            }

            val os = response.outputStream

            val outchannel = Channels.newChannel(os)
            val inchannel = fileInfo.createChannel()
            val request = inchannel.createRequest()

            request.setType(DiskManagerRequest.REQUEST_READ);
            request.setOffset(start)
            request.setLength(length)
            request.setMaximumReadChunkSize(128*1024)

            val hasFailure = AtomicBoolean(false);

            request.addListener { event ->
                if (!hasFailure.get()) {
                    when (event.type) {
                        DiskManagerEvent.EVENT_TYPE_SUCCESS -> {
                            try {
                                val inbuffer = event.buffer.toByteBuffer()
                                inbuffer.position(0)
                                outchannel.write(inbuffer)
                            } catch (e: Exception) {
                                hasFailure.set(true)
                                request.cancel()
                            }
                        }
                        DiskManagerEvent.EVENT_TYPE_BLOCKED -> {
                            // just wait
                        }
                        DiskManagerEvent.EVENT_TYPE_FAILED -> {
                            hasFailure.set(true)
                            request.cancel()
                        }
                        else -> {
                            hasFailure.set(true)
                            request.cancel()
                        }
                    }
                }
            }

            request.run()
            os.close()
        }
    }

    override fun findDownload(hash: String): Download? {
        val filtered = downloadManager.downloads.filter { bytesToHex(it.torrentHash) == hash }
        return filtered.firstOrNull()
    }
}

private fun extractTorrentFileName(download: Download, info: DiskManagerFileInfo): String {
    val name = download.name
    val canFilePath = info.file.canonicalPath

    val indexOf = canFilePath.indexOf(name)
    if (indexOf < 0) return info.file.name

    if (indexOf + name.length == canFilePath.length) return name; // single-file torrent

    return canFilePath.substring(indexOf+name.length+1)
}

private val hexArray = "0123456789ABCDEF".toCharArray()
fun bytesToHex(bytes: ByteArray): String {
    val hexChars = CharArray(bytes.size * 2)
    for (j in bytes.indices) {
        val v = bytes[j].toInt() and 0xFF
        hexChars[j * 2] = hexArray[v.ushr(4)]
        hexChars[j * 2 + 1] = hexArray[v and 0x0F]
    }
    return String(hexChars)
}

private fun extractPriority(info: DiskManagerFileInfo): RestPriority {
    if (info.isPriority) return RestPriority.HIGH;
    if (info.isSkipped) return RestPriority.DONOTDOWNLOAD;
    if (info.isDeleted) return RestPriority.DELETE;

    return RestPriority.NORMAL;
}
