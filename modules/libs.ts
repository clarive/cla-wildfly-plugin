declare var require, _;

export const processError = (resErr, errors, title) => {
    const log = require('cla/log');
    const code =
        resErr instanceof Error ? -1 : resErr?.code ? resErr.code() : -1;

    const message =
        resErr instanceof Error
            ? resErr.toString()
            : resErr.message
            ? resErr.message()
            : resErr + '';

    let content = resErr instanceof Error ? '' : resErr.content();

    if (content) {
        try {
            content = JSON.parse(content);
        } catch (e) {
            content = { 'failure-description': '' };
        }
    } else {
        content = { 'failure-description': '' };
    }

    log.error(`Wildfly: ${_('%1: task finished', title)}: ${message}`, resErr);

    if (errors === 'return') {
        return {
            success: 0,
            content,
            code,
            message
        };
    } else {
        throw new Error(
            `Wildfly ERROR: code=${code}, msg: ${message} ${content['failure-description']}`
        );
    }
};
