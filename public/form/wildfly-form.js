(function(params) {

    var data = params.data || {};

    var serverCombo = Cla.ui.ciCombo({
        name: 'server',
        value: data.server || '',
        class: 'BaselinerX::CI::generic_server',
        fieldLabel: _('Server'),
        allowBlank: false,
        with_vars: 1
    });

    var pathWildfly = Cla.ui.textField({
        name: 'path',
        fieldLabel: _('Path to WildFly script'),
        value: data.path || '',
    });


    var args = Cla.ui.comboBox({
        name: 'arg',
        fieldLabel: _('Functions'),
        value: data.arg || [],
        data: [
            ['start', 'start'],
            ['stop', 'stop'],
            ['deploy', 'deploy'],
            ['undeploy', 'undeploy'],
            ['status', 'status']
        ],
        singleMode: true,
        allowBlank: false
    });
    args.on('addItem', function() {
        var v = args.getValue();
        if (v == 'start') {
            customParams.show();
            credentials.hide();
            file.hide();
            configFile.show();
            forceDeploy.hide();
            fileName.hide();
        } else if (v == 'stop') {
            customParams.show();
            customParams.setValue('--connect --command=:shutdown');
            credentials.hide();
            file.hide();
            configFile.hide();
            forceDeploy.hide();
            fileName.hide();
        } else if (v == 'deploy') {
            file.show();
            credentials.show();
            credentials.doLayout();
            customParams.hide();
            configFile.hide();
            forceDeploy.show();
            fileName.hide();

        } else if (v == 'undeploy') {
            file.hide();
            credentials.show();
            credentials.doLayout();
            customParams.hide();
            configFile.hide();
            forceDeploy.hide();
            fileName.show();
        } else if (v == 'status') {
            file.hide();
            credentials.show();
            credentials.doLayout();
            customParams.hide();
            configFile.hide();
            forceDeploy.hide();
            fileName.show();
        }
    });

    var configFile = Cla.ui.textField({
        name: 'configfile',
        fieldLabel: _('Configuration File'),
        value: data.configfile || '',
        hidden: true,
        allowBlank: false
    });
    var customParams = Cla.ui.textField({
        name: 'customParams',
        fieldLabel: _('Custom Params'),
        value: data.customParams || '',
        hidden: true
    });

    var file = Cla.ui.textField({
        name: 'file',
        fieldLabel: _('File path to deploy'),
        value: data.file || '',
        hidden: true
    });
    var fileName = Cla.ui.textField({
        name: 'filename',
        fieldLabel: _('Filename'),
        value: data.filename || '',
        hidden: true
    });
    var forceDeploy = Cla.ui.checkBox({
        fieldLabel: _('Force deploy'),
        name: 'force',
        hidden: true,
        checked: data.force == 1 ? true : false
    });

    var credentials = Cla.ui.panel({
        layout: 'column',
        fieldLabel: _('Credentials'),
        frame: true,
        hidden: (!data.arg || data.arg == 'start'),
        items: [{
            layout: 'form',
            columnWidth: .50,
            labelAlign: 'top',
            frame: true,
            items: {
                xtype: 'textfield',
                anchor: '100%',
                fieldLabel: _('Username'),
                name: 'username',
                value: data.username || ''
            }
        }, {
            layout: 'form',
            columnWidth: .50,
            labelAlign: 'top',
            frame: true,
            items: {
                xtype: 'textfield',
                anchor: '100%',
                fieldLabel: _('Password'),
                name: 'password',
                inputType: 'password',
                value: data.password || ''
            }
        }]
    });

    var errors = Cla.ui.errorManagementBox({
        errorTypeName: 'type',
        errorTypeValue: params.data.type || 'warn',
        rcOkName: 'ok',
        rcOkValue: params.data.ok,
        rcWarnName: 'warn',
        rcWarnValue: params.data.warn,
        rcErrorName: 'error',
        rcErrorValue: params.data.error,
        errorTabsValue: params.data
    });

    var panel = Cla.ui.panel({
        layout: 'form',
        items: [
            serverCombo,
            pathWildfly,
            args,
            configFile,
            credentials,
            file,
            fileName,
            customParams,
            forceDeploy,
            errors,
        ]
    });

    return panel;
})