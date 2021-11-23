(function (params) {
    var data = params.data || {};

    var server = Cla.ui.ciCombo({
        name: 'server',
        class: 'WildflyServer',
        fieldLabel: _('Wildfly Admin Server'),
        value: params.data.server || '',
        width: 400,
        allowBlank: false,
        with_vars: 1
    });

    var errors = Cla.ui.comboBox({
        name: 'errors',
        fieldLabel: 'Error Handling',
        data: [
            ['fail', _('Fail on error')],
            ['return', _('Return error and continue')]
        ],
        value: params.data.errors || 'fail',
        allowBlank: false,
        anchor: '100%',
        singleMode: true
    });

    var consoleText = Cla.ui.codeEditor({
        name: 'consoleText',
        fieldLabel: _('Console Text'),
        value: params.data.consoleText || params.data.config.console_text,
        height: 300,
        allowBlank: false
    });

    var panel = Cla.ui.panel({
        layout: 'form',
        items: [server, errors, consoleText ]
    });

    return panel;
});

