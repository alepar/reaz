package io.alepar.restazu

data class RestTorrent(
        val hash: String,
        val torrentName: String,
        val status: String,
        val sizeBytes: Long,
        val comment: String,
        val downloadedBytes: Long,
        val uploadedBytes: Long,
        val downloadBps: Long,
        val uploadBps: Long,
        val etaSecs: Long,
        val connectedLeechers: Int?,
        val connectedSeeds: Int?,
        val scrapedLeechers: Int?,
        val scrapedSeeds: Int?, val files: List<RestTorrentFile>
)

data class RestTorrentFile(
        val index: Int,
        val path: String,
        val sizeBytes: Long,
        val downloadedBytes: Long,
        val priority: RestPriority
)

enum class RestPriority {
    NORMAL, HIGH, DONOTDOWNLOAD, DELETE
}
