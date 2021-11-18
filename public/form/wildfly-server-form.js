(function (params) {
    var serverURL = Cla.ui.textField({
        name: 'serverURL',
        fieldLabel: _('Wildfly Admin Server URL'),
        allowBlank: false
    });

    var userTexfield = Cla.ui.textField({
        name: 'username',
        fieldLabel: _('Username'),
        allowBlank: false
    });

    var passTextfield = Cla.ui.textField({
        name: 'password',
        fieldLabel: _('Password'),
        allowBlank: false,
        inputType: 'password'
    });

    return [serverURL, userTexfield, passTextfield];
});
