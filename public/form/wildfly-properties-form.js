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

    var mode = Cla.ui.comboBox({
        name: 'mode',
        fieldLabel: 'Mode',
        data: [
            ['replace', _('Add or Replace System Properties')],
            ['delete', _('Delete System Properties')]
        ],
        value: params.data.mode || 'replace',
        allowBlank: false,
        anchor: '100%',
        singleMode: true
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

    var properties = Cla.ui.form.gridEditor({
        name: 'properties',
        fieldLabel: _('System Properties'),
        columns: 'key,Key;value,Value',
        records: params.data.properties
    });

    var panel = Cla.ui.panel({
        layout: 'form',
        items: [server, mode, errors, properties ]
    });

    return panel;
});


