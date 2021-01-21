/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
const { promiseTimeout } = require('@weave-js/utils');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'WeaveReque... Remove this comment to see the full error message
const { WeaveRequestTimeoutError } = require('../errors');
const wrapTimeoutMiddleware = function (handler, action) {
    const self = this;
    const registryOptions = self.options.registry || {};
    return function timeoutMiddleware(context) {
        if (typeof context.options.timeout === 'undefined' || registryOptions.requestTimeout) {
            context.options.timeout = registryOptions.requestTimeout || 0;
        }
        if (context.options.timeout > 0 && !context.startHighResolutionTime) {
            context.startHighResolutionTime = process.hrtime();
        }
        let promise = handler(context);
        if (context.options.timeout > 0) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            promise = promiseTimeout(context.options.timeout, promise, new WeaveRequestTimeoutError(context.action.name, context.nodeId))
                .catch(error => {
                if (error instanceof WeaveRequestTimeoutError) {
                    self.log.warn(`Request '${context.action.name}' timed out.`);
                }
                return Promise.reject(error);
            });
        }
        return promise;
    };
};
module.exports = () => {
    return {
        localAction: wrapTimeoutMiddleware,
        remoteAction: wrapTimeoutMiddleware
    };
};
