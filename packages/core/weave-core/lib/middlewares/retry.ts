
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

import { Middleware } from "../broker/middleware"

const { delay } = require('@weave-js/utils')

const wrapRetryMiddleware = function (handler, action) {
  const self = this
  const options = Object.assign({}, self.options.retryPolicy, action.retryPolicy || {})

  // middleware is enabled
  if (options.enabled) {
    // Return middlware handler
    return function retryMiddleware (context) {
      // if the context has no repeat count, set it to zero.
      if (context.retryCount === undefined) {
        context.retryCount = 0
      }

      const attempts = typeof context.options.retries === 'number' ? context.options.retries : options.retries
      return handler(context).catch(error => {
        if (context.retryCount++ < attempts && error.retryable === true) {
          self.log.warn(`Retry to recall action '${context.action.name}' after ${options.delay}.`)
          return delay(options.delay)
            .then(() => self.call(context.action.name, context.data, { context }))
        }
        return Promise.reject(error)
      })
    }
  }
  return handler
}

export function createRetryMiddleware(): Middleware {
  return {
    localAction: wrapRetryMiddleware,
    remoteAction: wrapRetryMiddleware
  }
}
