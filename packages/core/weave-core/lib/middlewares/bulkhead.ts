/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

import { Middleware } from "../broker/middleware"

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'WeaveQueue... Remove this comment to see the full error message
const { WeaveQueueSizeExceededError } = require('../errors')

const wrapBulkheadMiddleware = function (handler, action) {
  const self = this
  const bulkheadOptions = self.options.bulkhead || {}

  if (bulkheadOptions.enabled) {
    const queue = []
    let currentlyInFlight = 0

    const callNext = () => {
      if (queue.length === 0) return
      if (currentlyInFlight >= bulkheadOptions.concurrentCalls) return

      const item = queue.shift()

      currentlyInFlight++
      handler(item.context)
        .then(result => {
          currentlyInFlight--
          item.resolve(result)
          callNext()
        })
        .catch(error => {
          currentlyInFlight--
          callNext()
          return item.reject(error)
        })
    }

    return function bulkheadMiddlware (context) {
      // Execute action immediately
      if (currentlyInFlight < bulkheadOptions.concurrentCalls) {
        currentlyInFlight++
        return handler(context)
          .then(result => {
            currentlyInFlight--
            callNext()
            return result
          })
          .catch(error => {
            currentlyInFlight--
            callNext()
            return Promise.reject(error)
          })
      }

      // Reject the action if the max queue size is reached.
      if (bulkheadOptions.maxQueueSize && bulkheadOptions.maxQueueSize < queue.length) {
        return Promise.reject(new WeaveQueueSizeExceededError({
          action: action.name,
          limit: bulkheadOptions.maxQueueSize,
          size: queue.length
        }))
      }

      // Queue the request
      return new Promise((resolve, reject) => queue.push({ resolve, reject, context }))
    }
  }
  return handler
}
export function createBulkheadMiddleware (): Middleware { 
  return {
    localAction: wrapBulkheadMiddleware
  }
}
