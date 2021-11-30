# WildFly Plugin

<img src="https://cdn.rawgit.com/clarive/cla-wildfly-plugin/master/public/icon/wildfly.svg?sanitize=true" alt="Wildfly Plugin" title="Wildfly Plugin" width="120" height="120">

The WildFly plugin will allow you to interact with the WildFly server when performing and undoing deployments. It is
compatible with Jboss 7 and later.

## Requirements

There are no requirements outlined in Clarive in order to work with this plugin.

## Installation

To install the plugin, rename the top-level folder to `cla-wildfly-plugin` and place it inside the
`$CLARIVE_BASE/plugins` directory in a Clarive instance.

### WildFly Management Rest API

Sends JSON requests to the Wildfly Management rest API. Requires
that Wildfly Management be available on the server.

- **Method**: either GET, POST or DELETE (PUT is the same as POST
in Wildfly api). Depends on the request your're making.
- **Request JSON**: JSON text with the REST request.

Example REST request (POST):

```json
{ "operation": "read-resource", "address": [{"system-property": "myprop"}] }
```

To see the result, setup a `Return Key` in the op `Options` panel.
The data returned into the stash will be something like this:

```yaml
  data:
    outcome: success
    result:
      value: '123'
  message: OK
  status: 200
  success: 1
```

```json
{ "operation": "add", "address": [{"system-property": "myprop"}], "value": "myvalue" }
```

```json
{ "operation":"read-attribute", "name":"server-state" }
```

```json
{
"operation":"read-attribute","name":"status","recursive":"true",
"include-runtime":"true", "address":["deployment","simtx-pagamento-api.war"]
}
```

### WildFly Management Console

Sends console requests to the Wildfly Management server by
parsing the command and converting it into JSON.

We recommend using the `Wildfly Management REST API` whenever
possible, as all CLI-style commands can be converted into JSON
requests, but you can try this op in case you don't know
how to convert a CLI command into JSON.

Example `Console Text`:

```
/system-property=jtest1:add(value=jvalue)
```

```
/subsystem=logging:read-operation-names
```

Which returns the following into the stash (if a `Return key` was set in the
`Options` pane):

```yaml
  data:
    outcome: success
    result:
    - add
    - list-add
    - list-clear
    - list-get
    - list-log-files
    - list-remove
    - map-clear
    - map-get
    - map-put
    - map-remove
    - query
    - read-attribute
    - read-attribute-group
    - read-attribute-group-names
    - read-children-names
    - read-children-resources
    - read-children-types
    - read-log-file
    - read-operation-description
    - read-operation-names
    - read-resource
    - read-resource-description
    - remove
    - undefine-attribute
    - whoami
    - write-attribute
  message: OK
  status: 200
  success: 1
```

### WildFly Deploy

Deploys a file to the application server.

- **Local file to deploy** - the path to a file local to the Clarive server
  process running this rule. Typically the path will be prepended with
  `${job_dir}/...`.

- **Remote file** (Optional) - the name of the Wildfly remote resource being
  deployed, ie `myfile.war`.  If omitted, Clarive will use the `Local file to
  deploy` file+extension part as the remote file.

This op will fail if the remote resource already exists. Undeploy first to be
sure.

### WildFly Undeploy

Undeploys a file to the application server.

- **Remote file** - the name of the Wildfly remote resource being undeployed,
  ie `myfile.war`.

This op will fail if the remote resource does not exist.  Set the **Errors**
mode to "Return..." to prevent failure.

### WildFly Download

Downloads a resource from Wildfly to a local file. Wildfly resources
will typically be deployed .war or .ear files, but it can be any resource
Wildfly enables to be downloaded: server logs, xml files, etc.

- **Remote file** - name of the Wildfly remote resource being
  downloaded, ie `myfile.war`.

- **Resource type** - for deployed files (war, ear) this should be `deployment`,
  but for other types of resources, it will need to be set accordingly, such
  as `logging` for log files. This depends on the Wildfly resource address/path,
  check your Wildfly docs for more info.

- **Local file** - the path to a file local to the Clarive server
  where the remote file will be written. Typically the path will be prepended with
  `${job_dir}/...`.

This op will fail if the remote resource does not exist.  Set the **Errors**
mode to "Return..." to prevent failure.

### WildFly System Properties

Add, replace or delete system properties.

- **System properties** - the key and value of each property to be set.
If deleting, the `value` column is ignored.

- **Mode** - set the mode, `Add or Replace` will add or replace the system
properties value in the Wildfly server. `Delete` will delete system properties.

To view your server system properties, this is the Wildfly Management URL:

```
http://mywildlyserver:9990/console/index.html#system-properties
```

### WildFly Management CLI

Sends predefined commands to the CLI console. Requires
remote access to the console.

**Note**: this method for Wildfly management is deprecated in favor of the newer
`Wildfly Management REST API` and `Wildfly Management Console` ops.

The various parameters are:

- **Server (variable name: server)** - Server where WildFly is installed.
- **Path to WildFly script (path)** - Path to WildFly command-line (CLI) script.
- **Functions (arg)** - List of Wildfly functions that you can use.
    - **Start ("start")** - Start the WildFly server.
    - **Stop ("stop")** - Stop the WildFly server.
    - **Deploy ("deploy")** - Deploy the file declared in `File path to deploy`.
    - **Undeploy ("undeploy")** - Undeploy the file declared in `Filename`.
    - **Status ("status")** - Returns the application deployments in Wildfly server.
- **Configuration File (configfile)** - File name to use for configuration. Use only with start function.
- **Credentials (user)** - Add the Username and Password for the WildFly Server.
- **File path to deploy (file)** - File path to deploy to. Use only with the deploy function.
- **Force deploy (force)** - Force a deployment. Use only with the deploy function.
- **Filename (filename)** - File name to undeploy to. Use only with the undeploy function.
- **Custom Params (custom_params)** - Parameters that can be used by the command line. Use with stop and start.

**Only Clarive EE**

- **Errors and Output** - These two fields concern management of control errors. Their options are:
   - **Fail and Output Error** - Search for the configured error pattern in script output. If found, an error message is
     displayed in the monitor showing the match.
   - **Warn and Output Warn** - Search for the configured warning pattern in the script output. If found, an error
     message is displayed in the monitor showing the match.
   - **Custom** - Where combo errors is set to custom, a new form is displayed for defining using the following fields:
      - **OK** - Range of return code values for the script to have succeeded. No message will be displayed in the
        monitor.
      - **Warn** - Range of return code values to warn the user. A warning message will be displayed in the monitor.
      - **Error** - Range of return code values for the script to have failed. An error message will be displayed in the
        monitor.
   - **Silent** - Silence all errors found.

## How to use

### In Clarive EE

Once the plugin is placed in its folder, you can find this service in the palette in the section of generic service and can be used like any other palette op.

Op Name: **WildFly Application Server**

Configuration start example:

```yaml
    Server CI: GenericServer
    Path to WildFly script: /wildfly/bin/standalone.sh
    Functions: start
    Configuration File: standalone.xml
```

Due possible delay in starting the WildFly server, it is recommended to add a timeout if you wish to perform a deployment service.

Configuration deployment example:

```yaml
    Server CI: GenericServer
    Path to WildFly script: /wildfly/bin/jboss-cli.sh
    Functions: deploy
    Credentials:
        username: user
        password: *********
    File path to deploy: /path/to/example.war
```

### In Clarive SE

#### Rulebook

If you want to use the plugin through the Rulebook, in any `do` block, use this ops as examples to configure the different parameters:

```yaml
rule: Wildfly demo
do:
   - wildfly_task:
      server: 'wildfly_server'            # Required. Use the mid set to the resource you created
      path: '/wildfly/bin/standalone.sh'  # Required
      arg: 'start'                        # Required
      configfile: "/projects/standalone.xml"
```

```yaml
rule: Wildfly demo
do:
   - wildfly_task:
      server: 'wildfly_server'            # Required. Use the mid set to the resource you created
      path: '/wildfly/bin/standalone.sh'  # Required
      arg: 'deploy'                       # Required
      username: "user"
      password: "12345678"
      file: '/path/to/example.war'
      force: '0'
```

```yaml
rule: Wildfly demo
do:
   - wildfly_task:
      server: 'wildfly_server'            # Required. Use the mid set to the resource you created
      path: '/wildfly/bin/standalone.sh'  # Required
      arg: 'undeploy'                     # Required
      filename: "file.war"
```

##### Outputs

###### Success

The service will return the console output for the executed command.

###### Possible configuration failures

**Task failed**

You will get the console error output.

**Variable required**

```yaml
Error in rulebook (compile): Required argument(s) missing for op "wildfly_task": "arg"
```

Make sure you have all required variables defined.

**Not allowed variable**

```yaml
Error in rulebook (compile): Argument `Arg` not available for op "wildfly_task"
```

Make sure you are using the correct paramaters (make sure you are writing the variable names correctly).

## More questions?

Feel free to join **[Clarive Community](https://community.clarive.com/)** to resolve any of your doubts.
