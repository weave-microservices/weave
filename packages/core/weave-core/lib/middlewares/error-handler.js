/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const { WeaveError } = require('../errors')

const wrapErrorHandlerMiddleware = function (handler) {
  const broker = this
  return function errorHandlerMiddlware (context) {
    return handler(context)
      .catch(error => {
        if (!(error instanceof Error)) {
          error = new WeaveError(error, 500)
        }
        if (broker.nodeId !== context.nodeId) {
          broker.transport.removePendingRequestsById(context.id)
        }

        broker.log.debug(`The action ${context.action.name} is rejected`, { requestId: context.id }, error)
        return broker.handleError(error)
      })
  }
}

module.exports = () => {
  return {
    localAction: wrapErrorHandlerMiddleware,
    remoteAction: wrapErrorHandlerMiddleware
  }
}
