"use strict";
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTimeoutMiddleware = void 0;
const utils_1 = require("@weave-js/utils");
const errors_1 = require("../errors");
const wrapTimeoutMiddleware = function (handler, action) {
    const self = this;
    const registryOptions = self.options.registry || {};
    return function timeoutMiddleware(context) {
        if (typeof context.options.timeout === 'undefined' || registryOptions.requestTimeout) {
            context.options.timeout = registryOptions.requestTimeout || 0;
        }
        if (context.options.timeout > 0 && !context.info.startHighResolutionTime) {
            context.info.startHighResolutionTime = process.hrtime();
        }
        let promise = handler(context);
        if (context.options.timeout > 0) {
            promise = utils_1.promiseTimeout(context.options.timeout, promise, new errors_1.WeaveRequestTimeoutError(context.action.name, context.nodeId, context.options.timeout))
                .catch(error => {
                if (error instanceof errors_1.WeaveRequestTimeoutError) {
                    self.log.warn(`Request '${context.action.name}' timed out.`);
                }
                return Promise.reject(error);
            });
        }
        return promise;
    };
};
function createTimeoutMiddleware() {
    return {
        localAction: wrapTimeoutMiddleware,
        remoteAction: wrapTimeoutMiddleware
    };
}
exports.createTimeoutMiddleware = createTimeoutMiddleware;
//# sourceMappingURL=timeout.js.map