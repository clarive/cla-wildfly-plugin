var reg = require('cla/reg');

reg.register('service.wildfly.server', {
    name: 'WildFly Application Server',
    icon: '/plugin/cla-wildfly-plugin/icon/wildfly.svg',
    form: '/plugin/cla-wildfly-plugin/form/wildfly-form.js',
    rulebook: {
        moniker: 'wildfly_task',
        description: _('Executes Wildfly commands'),
        required: [ 'server', 'path', 'arg'],
        allow: ['server', 'path', 'arg', 'configfile', 'custom_params', 'file', 
        'filename', 'force', 'username', 'password', 'errors'],
        mapper: {
            'custom_params':'customParams',
            'errors':'type'
        },
        examples: [{
            wildfly_task: {
                server: 'wildfly_server',
                path: '/wildfly/bin/standalone.sh',
                arg: 'start',
                configfile: "/projects/standalone.xml"
            }
        },{
            wildfly_task: {
                server: 'wildfly_server',
                path: '/wildfly/bin/standalone.sh',
                arg: 'deploy',
                username: "user",
                password: "***",
                file: '/tmp/example.war',
                force: '0'
            }
        },{
            wildfly_task: {
                server: 'wildfly_server',
                path: '/wildfly/bin/standalone.sh',
                arg: 'undeploy',
                filename: "file.war"
            }
        }]
    },
    handler: function(ctx, params) {
        var ci = require("cla/ci");
        var log = require('cla/log');
        var reg = require('cla/reg');
        var jbossServer = params.server;
        var command = '';
        var pathWildfly = params.path || '';
        var arg = params.arg || '';
        var customParams = params.customParams || '';
        var username = params.username || '';
        var password = params.password;
        var pathFile = params.file || '';
        var fileName = params.filename || '';
        var configFile = params.configfile || '';
        var eforc = params.force || 0;
        var ciServer = ci.findOne({
            mid: jbossServer + ''
        });

        if (!ciServer) {
            log.error(_("CI Server not found"));
            throw new Error(_('CI Server not found'));
        }

        if (arg == 'start') {
            command = pathWildfly + ' --server-config=' + configFile + ' ' + customParams + '&';
        } else if (arg == 'stop') {
            command = pathWildfly + ' ' + customParams;
        } else {
            command = pathWildfly;
            if (username && password) {
                command = command + ' --user=' + username + ' --password=' + password;
            }
            command = command + ' --connect --command=';

            if (arg == 'status') {
                command = command + '"deployment-info --name=' + fileName + '"';
            } else if (arg == 'undeploy') {
                command = command + '"undeploy ' + fileName + '"';
            } else if (arg == 'deploy') {
                command = command + '"deploy ';
                if (force == 1) {
                    command = command + '--force ';
                }
                command = command + pathFile + '"';
            }
        }

        var output = reg.launch('service.scripting.remote', {
            name: 'Run WildFly script',
            config: {
                errors: params.type,
                server: params.server,
                user: params.user,
                home: params.home,
                path: command,
                output_error: params.output_error,
                output_warn: params.output_warn,
                output_capture: params.output_capture,
                output_ok: params.output_ok,
                meta: params.meta,
                rc_ok: params.ok,
                rc_error: params.error,
                rc_warn: params.warn
            }
        });
        return output.output;
    }
});