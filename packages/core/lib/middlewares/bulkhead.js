/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { WeaveQueueSizeExceededError } = require('../errors')

const wrapBulkheadMiddleware = function (handler, action) {
    const self = this
    const options = self.options.bulkhead || {}

    if (options.enabled) {
        const queue = []
        let currentlyInFlight = 0

        const callNext = () => {
            if (queue.length === 0) return
            if (currentlyInFlight >= options.concurrency) return

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
            if (currentlyInFlight < options.concurrency) {
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
            if (options.maxQueueSize && options.maxQueueSize < queue.length) {
                return Promise.reject(new WeaveQueueSizeExceededError({
                    action: action.name,
                    limit: options.maxQueueSize,
                    size: queue.length
                }))
            }
            // Queue the request
            return new Promise((resolve, reject) => queue.push({ resolve, reject, context }))
        }
    }
    return handler
}
module.exports = () => {
    return {
        localAction: wrapBulkheadMiddleware,
        remoteAction: wrapBulkheadMiddleware
    }
}
