/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const { WeaveError } = require('../errors')

module.exports = (runtime) => {
  const wrapErrorHandlerMiddleware = function (handler) {
    return function errorHandlerMiddleware (context) {
      return handler(context)
        .catch(error => {
          if (!(error instanceof Error)) {
            error = new WeaveError(error, 500)
          }

          if (runtime.nodeId !== context.nodeId) {
            runtime.transport.removePendingRequestsById(context.id)
          }

          runtime.log.debug(`The action ${context.action.name} is rejected`, { requestId: context.id }, error)
          return runtime.handleError(error)
        })
        // .catch(error => {
        //   runtime.log.error(error)
        // })
    }
  }

  return {
    localAction: wrapErrorHandlerMiddleware,
    remoteAction: wrapErrorHandlerMiddleware
  }
}
