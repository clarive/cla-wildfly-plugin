# WildFly Plugin

The WildFly plugin will allow you to interact with the WildFly server when performing and undoing deployments. It is
compatible with Jboss 7 and later. 

## Requirements

There are no requirements outlined in Clarive in order to work with this plugin.

## Installation

To install the plugin, rename the top-level folder to `cla-wildfly-plugin` and place it inside the
`CLARIVE_BASE/plugins` directory in a Clarive instance.

## How to Use

Once the plugin is correctly installed, you will have a new palette service called 'WildFly Application Server'.

### WildFly Application Server

This palette service will enable you to use commands that allow you to interact with the WildFly server. The main fields
are:

- **Server** - Server where WildFly is installed.
- **Path to WildFly script** - Path to WildFly command-line (CLI) script.
- **Functions** - List of Wildfly functions that you can use.
    - **Start** - Start the WildFly server.
    - **Stop** - Stop the WildFly server.
    - **Deploy** - Deploy the file declared in `File path to deploy`.
    - **Undeploy** - Undeploy the file declared in `Filename`.
    - **Status** - Returns the application deployments in Wildfly server.
- **Configuration File** - File name to use for configuration. Use only with start function.
- **Credentials** - Add the Username and Password for the WildFly Server.
- **File path to deploy** - File path to deploy to. Use only with the deploy function.
- **Force deploy** - Force a deployment. Use only with the deploy function.
- **Filename** - File name to undeploy to. Use only with the undeploy function.
- **Custom Params** - Parameters that can be used by the command line. Use with stop and start.

Configuration start example:

    Server CI: GenericServer
    Path to WildFly script: /wildfly/bin/standalone.sh
    Functions: start
    Configuration File: standalone.xml

Due to the possible delay in starting the WildFly server, it is advisable to add a timeout if you then wish to perform
a deployment service.
    
Configuration deployment example:

    Server CI: GenericServer
    Path to WildFly script: /wildfly/bin/jboss-cli.sh
    Functions: deploy
    Credentials: 
        username: user
        password: ***
    File path to deploy: /tmp/example.war

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
