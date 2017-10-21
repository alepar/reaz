package io.alepar.restazu

import io.javalin.UploadedFile
import org.gudy.azureus2.plugins.PluginConfig
import org.gudy.azureus2.plugins.PluginInterface
import org.gudy.azureus2.plugins.disk.DiskManagerFileInfo
import org.gudy.azureus2.plugins.download.Download
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream

interface AzureusApi {

    fun getDownloads() : Map<String, RestDownload>;

    fun getDownloadFiles() : Map<String, Map<Int, RestDownloadFile>>;

    fun getSpeedLimits() : RestSpeedLimits;

    fun upload(uploadedFiles: List<UploadedFile>)
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
