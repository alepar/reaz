package io.alepar.restazu

import io.javalin.ApiBuilder.*
import io.javalin.Javalin
import org.gudy.azureus2.plugins.Plugin
import org.gudy.azureus2.plugins.PluginInterface
import java.net.InetAddress
import java.net.InetSocketAddress

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
            .start()

    private val azureus : AzureusApi = PluginInterfaceAzureusApi(iface)
    private val differ: IncrementalGenerator = GuavaJacksonIncrementalGenerator()

    init {
        app.routes({ ->
            path("api") { ->

                path("private") { ->

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

                path("public") { ->

                }
            }
        })

        app.before { ctx ->
            ctx.header("Access-Control-Allow-Origin", "*")
        }

        app.options("/*") { ctx ->
            ctx.header("Access-Control-Allow-Methods", "post, get, options")
            ctx.header("Access-Control-Allow-Headers", "Content-Type")
            ctx.status(200)
        }

    }

}

