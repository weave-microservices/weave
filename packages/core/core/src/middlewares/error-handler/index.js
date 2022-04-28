/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

const { WeaveError } = require('../../');

module.exports = (runtime) => {
  const wrapErrorHandlerMiddleware = function (handler) {
    return function errorHandlerMiddleware (context, serviceInjections) {
      return handler(context, serviceInjections)
        .catch(error => {
          if (!(error instanceof Error)) {
            error = new WeaveError(error, 500);
          }

          if (runtime.nodeId !== context.nodeId) {
            runtime.transport.removePendingRequestsById(context.id);
          }

          runtime.log.debug(`The action ${context.action.name} is rejected`, { requestId: context.id }, error);
          return runtime.handleError(error);
        });
      // .catch(error => {
      //   runtime.log.error(error)
      // })
    };
  };

  return {
    localAction: wrapErrorHandlerMiddleware,
    remoteAction: wrapErrorHandlerMiddleware
  };
};
