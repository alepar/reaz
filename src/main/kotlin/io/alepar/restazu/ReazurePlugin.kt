package io.alepar.restazu

import io.javalin.ApiBuilder.*
import io.javalin.Javalin
import org.gudy.azureus2.plugins.Plugin
import org.gudy.azureus2.plugins.PluginInterface
import org.gudy.azureus2.plugins.disk.DiskManagerFileInfo
import org.gudy.azureus2.plugins.download.DownloadManager
import java.net.InetAddress
import java.net.InetSocketAddress

class ReazurePlugin : Plugin {

    override fun initialize(iface: PluginInterface?) {
        if (iface == null) throw IllegalArgumentException("pluginInterface cannot be null");

        AzureusRestApi(iface);
    }
}

data class User(val name: String, val email: String);

class AzureusRestApi(val iface: PluginInterface) {

    private val listenAddress = InetSocketAddress(InetAddress.getLoopbackAddress(), 7000)

    private val app = Javalin.create()
            .embeddedServer(ListenCustomizableServerFactory(listenAddress))
            .start()
    private val downloadManager: DownloadManager

    init {
        downloadManager = iface.downloadManager;

        app.routes({ ->
            path("api") { ->

                path("private") { ->

                    path("torrents") { ->

                        get("") { ctx ->
                            ctx.json(downloadManager.downloads.map { download ->
                                val torrent = download.torrent
                                val stats = download.stats
                                val peerStats = download.peerManager?.stats
                                val lastScrape = download.lastScrapeResult

                                RestTorrent(
                                        bytesToHex(torrent.hash),
                                        download.name,
                                        stats.status,
                                        torrent.size,
                                        torrent.comment,
                                        stats.downloaded,
                                        stats.uploaded,
                                        stats.downloadAverage,
                                        stats.uploadAverage,
                                        stats.etaSecs,
                                        peerStats?.connectedLeechers,
                                        peerStats?.connectedSeeds,
                                        lastScrape?.nonSeedCount,
                                        lastScrape?.seedCount,
                                        download.diskManagerFileInfo.map {
                                            val tf = torrent.files[it.index]
                                            RestTorrentFile(
                                                    it.index,
                                                    tf.name,
                                                    tf.size,
                                                    it.downloaded,
                                                    extractPriority(it)
                                            )
                                        }
                                )
                            })
                        }

                    }
                }

                path("public") { ->

                }
            }
        })

    }

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

