/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

import { Middleware } from "../broker/middleware"
import { promiseTimeout } from '@weave-js/utils'
import { WeaveRequestTimeoutError } from '../errors'

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
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
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

export function createTimeoutMiddleware(): Middleware {
  return {
    localAction: wrapTimeoutMiddleware,
    remoteAction: wrapTimeoutMiddleware
  }
}
