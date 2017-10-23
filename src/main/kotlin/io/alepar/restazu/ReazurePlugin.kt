package io.alepar.restazu

import io.javalin.ApiBuilder.*
import io.javalin.Javalin
import org.gudy.azureus2.plugins.Plugin
import org.gudy.azureus2.plugins.PluginInterface
import java.lang.Integer.parseInt
import java.lang.Long.parseLong
import java.net.InetAddress
import java.net.InetSocketAddress
import java.util.regex.Pattern

class ReazurePlugin : Plugin {

    override fun initialize(iface: PluginInterface?) {
        if (iface == null) throw IllegalArgumentException("pluginInterface cannot be null");

        AzureusRestApi(iface);
    }
}

data class User(val name: String, val email: String);

class AzureusRestApi(private val iface: PluginInterface) {

    private val listenAddress = InetSocketAddress(InetAddress.getLoopbackAddress(), 7000)

    private val app = Javalin.create()
            .embeddedServer(ListenCustomizableServerFactory(listenAddress))

    private val azureus : AzureusApi = PluginInterfaceAzureusApi(iface)
    private val differ: IncrementalGenerator = GuavaJacksonIncrementalGenerator()

    init {
        app.routes({ ->
            get("/") { ctx ->
                val instream = this.javaClass.classLoader.getResourceAsStream("static/index.html")
                ctx.status(200)
                ctx.header("Content-Type", "text/html")
                instream.copyTo(ctx.response().outputStream)
            }

            path("private") { ->

                path("api") { ->

                    before { ctx ->
                        ctx.header("Access-Control-Allow-Origin", "*")
                    }

                    path("serverstate") { ->

                        get { ctx ->
                            val token = ctx.request().getParameter("token")
                            val curstate = RestServerState(
                                    azureus.getDownloads(),
                                    azureus.getDownloadFiles(),
                                    azureus.getSpeedLimits()
                            )

                            val incremental = if(token == null) differ.start(curstate) else differ.incremental(token, curstate)

                            ctx.json(incremental)
                        }
                    }

                    path("upload") { ->

                        post { ctx ->
                            val uploadedFiles = ctx.uploadedFiles("files")
                            azureus.upload(uploadedFiles)
                            ctx.status(200);
                        }

                    }
                }

            }

            path("public") { ->

                path("download") { ->

                    before() { ctx ->
                        ctx.header("Accept-Ranges", "bytes")
                    }

                    get("/:hash/:idx") { ctx ->
                        val hash = ctx.param("hash")
                        val idx = ctx.param("idx")

                        val rangeHeader = ctx.request().getHeader("Range")

                        try {
                            if (hash != null && idx != null) {
                                azureus.sendFile(hash, parseInt(idx), ctx.response(), parseRange(rangeHeader))
                            } else {
                                throw IllegalArgumentException()
                            }
                        } catch (e: Exception) {
                            ctx.status(400)
                        }
                    }
                }

            }
        })

        app.options("/private/api/*") { ctx ->
            ctx.header("Access-Control-Allow-Methods", "post, get, options")
            ctx.header("Access-Control-Allow-Headers", "Content-Type")
            ctx.status(200)
        }

        app.enableStaticFiles("/static")

        app.start()
    }

    data class Range(val start: Long?, val end: Long?)

    private val patternRange = Pattern.compile("bytes=(\\d+)-(\\d*)")
    private fun parseRange(str: String?): Range? {
        if(str == null) return null

        val matcher = patternRange.matcher(str)
        if (!matcher.find()) throw IllegalArgumentException("bad range: {$str}")

        val startStr = matcher.group(1)
        val endStr = matcher.group(2)

        val start = if (startStr == null || startStr.isBlank()) null else parseLong(startStr.trim())
        val end = if (endStr == null || endStr.isBlank()) null else parseLong(endStr.trim())

        return Range(start, end)
    }

}

