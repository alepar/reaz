package io.alepar.restazu

import com.fasterxml.jackson.databind.JsonNode

data class RestDownload(
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
        val scrapedSeeds: Int?,
        val createdEpochMillis: Long
)

data class RestDownloadFile(
        val path: String,
        val sizeBytes: Long,
        val downloadedBytes: Long,
        val priority: RestPriority
)

enum class RestPriority {
    NORMAL, HIGH, DONOTDOWNLOAD, DELETE
}

data class RestSpeedLimits (
        val dlBps: Int,
        val ulBps: Int
)

data class RestServerState (
        val downloads: Map<String, RestDownload>,
        val downloadFiles: Map<String, Map<Int, RestDownloadFile>>,
        val speedLimits: RestSpeedLimits
)

data class RestIncremental (
        val token: String,
        val diff: RestJsonDiff
)

data class RestJsonDiff(
        val updated: JsonNode,
        val deleted: List<List<String>>
)