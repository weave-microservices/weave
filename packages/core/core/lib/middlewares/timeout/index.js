/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

const { promiseTimeout } = require('@weave-js/utils');
const { WeaveRequestTimeoutError } = require('../../errors');

const wrapTimeoutMiddleware = function (handler) {
  const self = this;
  const registryOptions = self.options.registry || {};

  return function timeoutMiddleware (context, serviceInjections) {
    if (typeof context.options.timeout === 'undefined' || registryOptions.requestTimeout) {
      context.options.timeout = registryOptions.requestTimeout || 0;
    }

    if (context.options.timeout > 0 && !context.startHighResolutionTime) {
      context.startHighResolutionTime = process.hrtime();
    }

    let promise = handler(context, serviceInjections);

    if (context.options.timeout > 0) {
      promise = promiseTimeout(context.options.timeout, promise, new WeaveRequestTimeoutError(context.action.name, context.nodeId, context.options.timeout))
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
