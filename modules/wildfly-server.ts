const ci = require('cla/ci');

ci.createRole('Wildfly');

ci.createClass('WildflyServer', {
    form: '/plugin/cla-wildfly-plugin/form/wildfly-server-form.js',
    icon: '/plugin/cla-wildfly-plugin/icon/wildfly.svg',
    roles: ['Wildfly'],
    has: {
        serverURL: {
            is: 'rw',
            isa: 'Str',
            required: true
        },
        realm: {
            is: 'rw',
            isa: 'Str',
            default: 'ManagementRealm',
            required: true
        },
        username: {
            is: 'rw',
            isa: 'Str',
            required: false
        },
        password: {
            is: 'rw',
            isa: 'Str',
            required: false
        }
    },
    methods: {
        server() {
            const url = this.serverURL();
            return url.replace(/^https?:\/\//, '');
        }
    }
});
