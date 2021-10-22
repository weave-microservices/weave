/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */

const { WeaveQueueSizeExceededError } = require('../../errors')

/**
 * @typedef {import('../../types').Runtime} Runtime
 * @typedef {import('../../types').Middleware} Middleware
*/

/**
 * Bulkhead middleware
 * @param {Runtime} runtime - Runtime
 * @returns {Middleware} Middleware
 */
module.exports = (runtime) => {
  const wrapBulkheadMiddleware = function (handler, action) {
    const bulkheadOptions = runtime.options.bulkhead

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

      return function bulkheadMiddlware (context, serviceInjections) {
        // Execute action immediately
        if (currentlyInFlight < bulkheadOptions.concurrentCalls) {
          currentlyInFlight++
          return handler(context, serviceInjections)
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

  return {
    created () {
      if (runtime.options.metrics.enabled) {
        // todo: add bulkhead metrics
      }
    },
    localAction: wrapBulkheadMiddleware
  }
}
