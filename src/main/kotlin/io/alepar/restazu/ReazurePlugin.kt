package io.alepar.restazu

import io.javalin.Javalin
import org.gudy.azureus2.plugins.Plugin
import org.gudy.azureus2.plugins.PluginInterface

class ReazurePlugin : Plugin {

    override fun initialize(iface: PluginInterface?) {
        if (iface == null) throw IllegalArgumentException("pluginInterface cannot be null");

        AzureusRestApi(iface);
    }
}

data class User(val name: String, val email: String);

class AzureusRestApi(val iface: PluginInterface) {

    init {
        val app = Javalin.create().port(7000).start()

        app.get("/") { ctx ->
            ctx.json(User("myuser", "a@a.ru"));
        }
    }

}
