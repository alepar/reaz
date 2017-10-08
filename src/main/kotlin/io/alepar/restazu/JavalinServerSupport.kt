package io.alepar.restazu

import io.javalin.core.JavalinServlet
import io.javalin.embeddedserver.EmbeddedServer
import io.javalin.embeddedserver.EmbeddedServerFactory
import io.javalin.embeddedserver.StaticFileConfig
import io.javalin.embeddedserver.jetty.JettyResourceHandler
import org.eclipse.jetty.server.Request
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.server.ServerConnector
import org.eclipse.jetty.server.handler.HandlerList
import org.eclipse.jetty.server.session.SessionHandler
import org.eclipse.jetty.util.thread.QueuedThreadPool
import org.slf4j.LoggerFactory
import java.net.InetSocketAddress
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class ListenCustomizableServerFactory(val listenAddress: InetSocketAddress) : EmbeddedServerFactory {

    override fun create(javalinServlet: JavalinServlet, staticFileConfig: StaticFileConfig?): EmbeddedServer {
        return ListenCustomizableJettyServer(
                Server(QueuedThreadPool(40, 2, 60000)),
                javalinServlet.apply { staticResourceHandler = JettyResourceHandler(staticFileConfig) },
                listenAddress
        )
    }
}

class ListenCustomizableJettyServer(private val server: Server, private val servlet: JavalinServlet, val listenAddress: InetSocketAddress) : EmbeddedServer {

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
