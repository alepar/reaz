package io.alepar.restazu

import io.javalin.core.JavalinServlet
import io.javalin.embeddedserver.*
import io.javalin.embeddedserver.jetty.JettyResourceHandler
import org.eclipse.jetty.http.MimeTypes
import org.eclipse.jetty.server.Request
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.server.ServerConnector
import org.eclipse.jetty.server.handler.HandlerList
import org.eclipse.jetty.server.handler.ResourceHandler
import org.eclipse.jetty.server.handler.gzip.GzipHandler
import org.eclipse.jetty.server.session.SessionHandler
import org.eclipse.jetty.util.resource.Resource
import org.eclipse.jetty.util.thread.QueuedThreadPool
import org.slf4j.LoggerFactory
import java.net.InetSocketAddress
import java.nio.file.Files
import java.nio.file.Paths
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class ListenCustomizableServerFactory(val listenAddress: InetSocketAddress) : EmbeddedServerFactory {

    override fun create(javalinServlet: JavalinServlet, staticFileConfig: StaticFileConfig?): EmbeddedServer {
        return ListenCustomizableJettyServer(
                Server(QueuedThreadPool(100, 2, 60000)),
                javalinServlet.apply { staticResourceHandler = FallbackToIndexJettyResourceHandler(staticFileConfig) },
                listenAddress
        )
    }
}

class ListenCustomizableJettyServer(private val server: Server, private val servlet: JavalinServlet, private val listenAddress: InetSocketAddress) : EmbeddedServer {

    private val log = LoggerFactory.getLogger(EmbeddedServer::class.java)

    override fun start(port: Int/*ignored*/): Int {

        val httpHandler = object : SessionHandler() {
            override fun doHandle(target: String, jettyRequest: Request, request: HttpServletRequest, response: HttpServletResponse) {
                if (request.isWebSocket()) return // don't touch websocket requests
                servlet.service(request.apply {
                    setAttribute("jetty-target", target)
                    setAttribute("jetty-request", jettyRequest)
                }, response)
                jettyRequest.isHandled = true
            }
        }

        server.apply {
            handler = HandlerList(httpHandler)
            connectors = arrayOf(ServerConnector(server).apply {
                this.port = listenAddress.port;
                this.host = listenAddress.hostName;
            })
        }.start()

        log.info("Jetty is listening on: " + server.connectors.map { (if (it.protocols.contains("ssl")) "https" else "http") + "://localhost:" + (it as ServerConnector).localPort })

        return (server.connectors[0] as ServerConnector).localPort
    }

    override fun stop() {
        server.stop()
        server.join()
    }

    override fun activeThreadCount(): Int = server.threadPool.threads - server.threadPool.idleThreads
    override fun attribute(key: String): Any = server.getAttribute(key)

}

fun HttpServletRequest.isWebSocket(): Boolean = this.getHeader("Sec-WebSocket-Key") != null

class FallbackToIndexJettyResourceHandler(staticFileConfig: StaticFileConfig?) : StaticResourceHandler {

    private val log = LoggerFactory.getLogger(JettyResourceHandler::class.java)

    private var initialized = false
    private val resourceHandler = ResourceHandler()
    private val gzipHandler = GzipHandler().apply { handler = resourceHandler }

    init {
        if (staticFileConfig != null) {
            resourceHandler.apply {
                resourceBase = getResourcePath(staticFileConfig)
                isDirAllowed = false
                isEtags = true
            }.start()
            initialized = true
            log.info("Static files enabled: {$staticFileConfig}. Absolute path: '${resourceHandler.resourceBase}'")
        }
    }

    fun getResourcePath(staticFileConfig: StaticFileConfig): String {
        val nosuchdir = "Static resource directory with path: '${staticFileConfig.path}' does not exist."
        if (staticFileConfig.location == Location.CLASSPATH) {
            val classPathResource = Resource.newClassPathResource(staticFileConfig.path)
            if (classPathResource == null) {
                throw RuntimeException(nosuchdir + " Depending on your setup, empty folders might not get copied to classpath.")
            }
            return classPathResource.toString()
        }
        if (Files.notExists(Paths.get(staticFileConfig.path))) {
            throw RuntimeException(nosuchdir)
        }
        return staticFileConfig.path
    }

    override fun handle(httpRequest: HttpServletRequest, httpResponse: HttpServletResponse): Boolean {
        if (initialized) {
            var target = httpRequest.getAttribute("jetty-target") as String
            val baseRequest = httpRequest.getAttribute("jetty-request") as Request
            try {
                var resource = resourceHandler.getResource(target)
                if (!resource.isFile()) {
                    target = "/index.html"
                    resource = resourceHandler.getResource(target)
                }

                val maxAge = if (target.startsWith("/immutable")) 31622400 else 0
                httpResponse.setHeader("Cache-Control", "max-age=$maxAge")

                httpResponse.setHeader("Content-Type", MimeTypes.getDefaultMimeByExtension(target))
                httpResponse.status = 200

                // TODO maybe support gzip?
                resource.inputStream.copyTo(httpResponse.outputStream)
                httpResponse.outputStream.close()

                return true;
            } catch (e: Exception) { // it's fine
                log.error("Exception occurred while handling static resource", e)
            }
        }

        return false
    }

    private fun Resource.isFile() = this.exists() && !this.isDirectory

}
