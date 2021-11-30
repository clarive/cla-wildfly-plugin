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

        const { server, method, requestBody } = params;
        const title = params.meta?.text || 'Wildfly API';
        const errors = params.errors || 'fail';

        const wf = ci.load(server);

        if (!requestBody?.length) {
            throw new Error('Request body is empty');
        }

        let fullUrl = wf.managementURL();

        // WF uses Digest authentication, we need LWP for that
        var ua = lwp.agent();
        ua.credentials(wf.server(), wf.realm(), wf.username(), wf.password());

        let output;

        try {
            const json = JSON.stringify(JSON.parse(requestBody));

            const res = ua.request(method?.toUpperCase() ?? 'POST', fullUrl, {
                content_type: 'application/json',
                content: json
            });

            if (res.isSuccess()) {
                log.info(`Wildfly: ${_('%1: task finished', title)}`, res);
                return {
                    success: 1,
                    data: JSON.parse(res.content()),
                    status: res.code(),
                    message: res.message()
                };
            } else {
                throw res;
            }
        } catch (resErr) {
            return processError(resErr, errors, title);
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

        let fullUrl = wf.managementURL();

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
                    log.info(
                        `Wildfly: ${_(
                            '%1: task finished',
                            title
                        )}: ${res.message()}`,
                        res
                    );
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

reg.register('service.wildfly.console', {
    name: 'WildFly Management Console',
    icon: '/plugin/cla-wildfly-plugin/icon/wildfly.svg',
    form: '/plugin/cla-wildfly-plugin/form/wildfly-console-form.js',
    rulebook,
    handler: (ctx, params) => {
        const ci = require('cla/ci');
        const log = require('cla/log');
        const reg = require('cla/reg');
        const lwp = require('cla/lwp');
        const { processError } = require('libs.ts');

        const title = params.meta?.text || 'Wildfly Console Command';
        let { server, consoleText, errors } = params;
        consoleText = consoleText?.trim().replace(/\n+/g, '');

        if (!consoleText) {
            throw new Error('Invalid console text');
        }

        const [, ...addresses] = consoleText.split('/');
        const [last, command] = addresses.pop().split(':');
        addresses.push(last);
        let [, operation, opArgs] = command.match(/^(\w+)\((.+)\)$/) ?? [];
        if (!operation) {
            operation = command;
        }

        const address = addresses.map(adr => {
            const [k, v] = adr.split('=');
            return { [k]: v };
        });

        let name, value;
        if ((name = last.match(/name=(.+)/))) {
            name = name[1];
        }
        if ((value = last.match(/value=(.+)/))) {
            value = value[1];
        }

        const wf = ci.load(server);

        let fullUrl = wf.managementURL();

        const ua = lwp.agent();
        ua.credentials(wf.server(), wf.realm(), wf.username(), wf.password());

        const req = {
            operation,
            address,
            'json.pretty': 1,
            name,
            value
        };
        const json = JSON.stringify(req);

        console.log(json);

        try {
            const res = ua.request('POST', fullUrl, {
                content_type: 'application/json',
                content: json
            });

            if (res.isSuccess()) {
                return {
                    success: 1,
                    data: JSON.parse(res.content()),
                    status: res.code(),
                    message: res.message()
                };
            } else {
                throw res;
            }
        } catch (resErr) {
            log.debug(json);
            const res = processError(resErr, errors, title);
            res.request = req;
            return res;
        }
    }
});

reg.register('service.wildfly.properties', {
    name: 'WildFly System Properties',
    icon: '/plugin/cla-wildfly-plugin/icon/wildfly.svg',
    form: '/plugin/cla-wildfly-plugin/form/wildfly-properties-form.js',
    rulebook,
    handler: (ctx, params) => {
        const ci = require('cla/ci');
        const log = require('cla/log');
        const reg = require('cla/reg');
        const lwp = require('cla/lwp');
        const { processError } = require('libs.ts');

        const title = params.meta?.text || 'Wildfly Console Command';
        let { server, properties, mode, errors } = params;

        const wf = ci.load(server);

        const fullUrl = wf.managementURL();

        const ua = lwp.agent();
        ua.credentials(wf.server(), wf.realm(), wf.username(), wf.password());

        const output = [];
        let json: string, req: object;

        for (let { key, value } of properties) {
            key = key.trim();
            if (mode == 'delete') {
                try {
                    req = {
                        operation: 'remove',
                        address: [{ 'system-property': key }]
                    };
                    json = JSON.stringify(req);

                    let res = ua.request('POST', fullUrl, {
                        content_type: 'application/json',
                        content: json
                    });

                    if (res.isSuccess()) {
                        log.info(
                            `Deleted system property ${key} at ${fullUrl}`
                        );
                        output.push({
                            success: 1,
                            key,
                            status: res.code(),
                            message: res.message()
                        });
                    } else {
                        throw res;
                    }
                } catch (resErr) {
                    log.debug(json);
                    const res = processError(resErr, errors, title);
                    res.request = req;
                    return res;
                }
            } else {
                try {
                    req = {
                        operation: 'write-attribute',
                        address: [{ 'system-property': key }],
                        name: 'value',
                        value
                    };
                    json = JSON.stringify(req);

                    let res = ua.request('POST', fullUrl, {
                        content_type: 'application/json',
                        content: json
                    });

                    if (res.isSuccess()) {
                        log.info(
                            `Replaced system property ${key} at ${fullUrl}`
                        );
                        output.push({
                            success: 1,
                            key,
                            status: res.code(),
                            message: res.message()
                        });
                    } else {
                        req = {
                            operation: 'add',
                            address: [{ 'system-property': key }],
                            value
                        };
                        json = JSON.stringify(req);

                        res = ua.request('POST', fullUrl, {
                            content_type: 'application/json',
                            content: json
                        });

                        if (res.isSuccess()) {
                            log.info(
                                `Added system property ${key} at ${fullUrl}`
                            );
                            output.push({
                                success: 1,
                                key,
                                status: res.code(),
                                message: res.message()
                            });
                        } else {
                            throw res;
                        }
                    }
                } catch (resErr) {
                    log.debug(json);
                    const res = processError(resErr, errors, title);
                    res.request = req;
                    res.key = key;
                    return res;
                }
            }
        }

        return {
            success: 1,
            output
        };
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

reg.register('service.wildfly.download', {
    name: 'WildFly Download Resource',
    icon: '/plugin/cla-wildfly-plugin/icon/wildfly.svg',
    form: '/plugin/cla-wildfly-plugin/form/wildfly-download-form.js',
    rulebook,
    handler: (ctx, params) => {
        const ci = require('cla/ci');
        const log = require('cla/log');
        const fs = require('cla/fs');
        const reg = require('cla/reg');
        const lwp = require('cla/lwp');
        const { processError } = require('libs.ts');

        const { server, resourceType } = params;
        const title = params.meta?.text || 'Wildfly Undeploy';
        const errors = params.errors || 'fail';
        const localFile = params.localFile?.trim();
        const remoteFile = params.remoteFile?.trim();

        const wf = ci.load(server);

        let fullUrl = wf.managementURL() + '?useStreamAsResponse';

        var ua = lwp.agent();
        ua.credentials(wf.server(), wf.realm(), wf.username(), wf.password());

        let output;

        try {
            let json = JSON.stringify({
                operation: 'read-content',
                address: [{ [resourceType ?? 'deployment']: remoteFile }],
                name: 'stream'
            });

            const res = ua.request('POST', fullUrl, {
                content_type: 'application/json',
                content: json,
                toFile: localFile
            });

            if (res.isSuccess()) {
                const bytes = res.content().length;
                log.info(`Remote resource ${remoteFile} downloaded to ${localFile} (bytes=${bytes})`);

                return {
                    success: 1,
                    bytes,
                    status: res.code(),
                    message: res.message()
                };
            } else {
                throw res;
            }
        } catch (resErr) {
            return processError(resErr, errors, title);
        }
    }
});
