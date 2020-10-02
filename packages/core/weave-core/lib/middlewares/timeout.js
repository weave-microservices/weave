/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const { promiseTimeout } = require('../../../weave-utils/lib')
const { WeaveRequestTimeoutError } = require('../errors')

const wrapTimeoutMiddleware = function (handler, action) {
  const self = this
  const registryOptions = self.options.registry || {}

  return function timeoutMiddleware (context) {
    if (typeof context.options.timeout === 'undefined' || registryOptions.requestTimeout) {
      context.options.timeout = registryOptions.requestTimeout || 0
    }

    if (context.options.timeout > 0 && !context.startHighResolutionTime) {
      context.startHighResolutionTime = process.hrtime()
    }

    let promise = handler(context)

    if (context.options.timeout > 0) {
      promise = promiseTimeout(context.options.timeout, promise, new WeaveRequestTimeoutError(context.action.name, context.nodeId))
        .catch(error => {
          if (error instanceof WeaveRequestTimeoutError) {
            self.log.warn(`Request '${context.action.name}' timed out.`)
          }

          return Promise.reject(error)
        })
    }
    return promise
  }
}

module.exports = () => {
  return {
    localAction: wrapTimeoutMiddleware,
    remoteAction: wrapTimeoutMiddleware
  }
}
