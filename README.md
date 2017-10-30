# Development

## Running plugin from your IDE

* Copy `./src/main/resources/plugin.properties` to `./workdir/plugins/reaz/`
* Run maven's `generate-resources` phase at to (re)compile prod js code 

Use this run config:
* **Main class:** org.gudy.azureus2.ui.common.Main
* **Program args:** --ui=console
* **Working directory:** ./workdir

