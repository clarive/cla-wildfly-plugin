declare var require, _;
var reg = require('cla/reg');

const rulebook = {
    moniker: 'wildfly_task',
    description: _('Runs Wildfly API Calls'),
    required: ['server', 'path', 'arg'],
    allow: ['server', 'path', 'username', 'password', 'errors'],
    mapper: {
        custom_params: 'customParams',
        errors: 'type'
    },
    examples: []
};

reg.register('service.wildfly.api', {
    name: 'WildFly Management Rest API',
    icon: '/plugin/cla-wildfly-plugin/icon/wildfly.svg',
    form: '/plugin/cla-wildfly-plugin/form/wildfly-api-form.js',
    rulebook,
    handler: (ctx, params) => {
        const ci = require('cla/ci');
        const log = require('cla/log');
        const reg = require('cla/reg');
        const lwp = require('cla/lwp');
        const { processError } = require('libs.ts');

        const { server, requestBody } = params;
        const title = params.meta?.text || 'Wildfly API';
        const errors = params.errors || 'fail';

        const wf = ci.load(server);

        if (!requestBody?.length) {
            throw new Error('Request body is empty');
        }

        let fullUrl = [wf.serverURL(), 'management'].join('/');
        fullUrl = fullUrl.replace(/([^\:])\/\//g, '$1/');

        // WF uses Digest authentication, we need LWP for that
        var ua = lwp.agent();
        ua.credentials(wf.server(), wf.realm(), wf.username(), wf.password());

        let output;

        try {
            const json = JSON.stringify(JSON.parse(requestBody));

            const res = ua.request('POST', fullUrl, {
                content_type: 'application/json',
                content: json
            });

            if (res.isSuccess()) {
                log.info(`Wildfly: ${_('%1: task finished', title)}`, res);
                return {
                    success: 1,
                    status: res.code(),
                    message: res.message()
                };
            } else if (errors === 'return') {
                log.error(`Wildfly: ${_('%1: task error', title)}`, res);
                return {
                    success: 0,
                    status: res.code(),
                    message: res.message()
                };
            } else {
                log.error(`Wildfly: ${_('%1: task error', title)}`, res);
                throw new Error(`Wildfly ERROR: status=${res.code()}`);
            }
        } catch (err) {
            log.error(`Wildfly: ${_('%1: op error', title)}`, err);
            if (errors === 'return') {
                return {
                    success: 0,
                    status: -1,
                    message: err + ''
                };
            } else {
                throw new Error(`Wildfly ERROR: ${err}`);
            }
        }
    }
});

reg.register('service.wildfly.deploy', {
    name: 'WildFly Deploy File',
    icon: '/plugin/cla-wildfly-plugin/icon/wildfly.svg',
    form: '/plugin/cla-wildfly-plugin/form/wildfly-deploy-form.js',
    rulebook,
    handler: (ctx, params) => {
        const ci = require('cla/ci');
        const log = require('cla/log');
        const reg = require('cla/reg');
        const lwp = require('cla/lwp');
        const { processError } = require('libs.ts');

        const { server, localFile } = params;
        const title = params.meta?.text || 'Wildfly Deploy';
        const errors = params.errors || 'fail';
        const remoteFile =
            params.remoteFile?.trim() || localFile.replace(/^.*\/(.+?)$/, '$1');

        const wf = ci.load(server);

        let fullUrl = [wf.serverURL(), 'management'].join('/');
        fullUrl = fullUrl.replace(/([^\:])\/\//g, '$1/');

        // WF uses Digest authentication, we need LWP for that
        var ua = lwp.agent();
        ua.credentials(wf.server(), wf.realm(), wf.username(), wf.password());

        let output;

        try {
            const res = ua.post(
                `${fullUrl}/add-content`,
                'Content-Type',
                'multipart/form-data',
                'Content',
                { file: [localFile] }
            );

            if (res.isSuccess()) {
                const token = JSON.parse(res.content()).result.BYTES_VALUE;

                const json = JSON.stringify({
                    content: [{ hash: { BYTES_VALUE: token } }],
                    address: [{ deployment: remoteFile }],
                    operation: 'add',
                    enabled: 'true'
                });

                const res2 = ua.request('POST', fullUrl, {
                    content_type: 'application/json',
                    content: json
                });

                if (res2.isSuccess()) {
                    log.info(`Wildfly: ${_('%1: task finished', title)}: ${res.message()}`, res);
                    return {
                        success: 1,
                        json,
                        status: res.code(),
                        message: res.message()
                    };
                } else {
                    throw res2;
                }
            } else {
                throw res;
            }
        } catch (resErr) {
            return processError(resErr, errors, title);
        }
    }
});

reg.register('service.wildfly.undeploy', {
    name: 'WildFly Undeploy File',
    icon: '/plugin/cla-wildfly-plugin/icon/wildfly.svg',
    form: '/plugin/cla-wildfly-plugin/form/wildfly-undeploy-form.js',
    rulebook,
    handler: (ctx, params) => {
        const ci = require('cla/ci');
        const log = require('cla/log');
        const reg = require('cla/reg');
        const lwp = require('cla/lwp');
        const { processError } = require('libs.ts');

        const { server } = params;
        const title = params.meta?.text || 'Wildfly Undeploy';
        const errors = params.errors || 'fail';
        const remoteFile = params.remoteFile?.trim();

        const wf = ci.load(server);

        let fullUrl = [wf.serverURL(), 'management'].join('/');
        fullUrl = fullUrl.replace(/([^\:])\/\//g, '$1/');

        // WF uses Digest authentication, we need LWP for that
        var ua = lwp.agent();
        ua.credentials(wf.server(), wf.realm(), wf.username(), wf.password());

        let output;

        try {
            let json = JSON.stringify({
                operation: 'undeploy',
                address: [{ deployment: remoteFile }]
            });
            const res = ua.request('POST', fullUrl, {
                content_type: 'application/json',
                content: json
            });

            if (res.isSuccess()) {
                json = JSON.stringify({
                    operation: 'remove',
                    address: [{ deployment: remoteFile }]
                });

                const res2 = ua.request('POST', fullUrl, {
                    content_type: 'application/json',
                    content: json
                });

                if (res2.isSuccess()) {
                    return {
                        success: 1,
                        status: res.code(),
                        message: res.message()
                    };
                } else {
                    throw res2;
                }
            } else {
                throw res;
            }
        } catch (resErr) {
            return processError(resErr, errors, title);
        }
    }
});
