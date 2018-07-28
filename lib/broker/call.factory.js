/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
'use strict'

const makeCallUtils = ({ state, log, options, registry }) => {
    let contextFactory = null

    function setContextFactory (cf) {
        contextFactory = cf
    }

    function call (actionName, params, opts = {}) {
        const endpoint = registry.getNextAvailableActionEndpoint(actionName, opts)

        if (endpoint instanceof Error) {
            return Promise.reject(endpoint)
        }

        const action = endpoint.action
        const nodeId = endpoint.node.id
        let context

        if (typeof opts.context !== 'undefined') {
            context = opts.context
            context.nodeId = nodeId
        } else {
            context = contextFactory.create(action, nodeId, params, opts)
        }

        if (endpoint.local) {
            log.debug(`Call action local.`, { action: actionName, requestId: context.requestId })
        } else {
            log.debug(`Call action on remote node.`, { action: actionName, nodeId, requestId: context.requestId })
        }

        const p = action.handler(context)

        // p = p.catch(error => errorCallHandler(error, context, endpoint, opts))
        p.context = context

        return p
    }

    // function localCall (context, endpoint, opts) {
    //     const action = endpoint.action

    //     if (context.metrics || statistics) {
    //         context.metricsStart()
    //     }

    //     let p = action.handler(context)

    //     if (options.circuitBreaker.enabled) {
    //         p = p.then(result => {
    //             endpoint.success()
    //             return result
    //         })
    //     }

    //     if (context.metrics || statistics) {
    //         p.then(result => {
    //             finishCall(context)
    //             return result
    //         })
    //     }

    //     p = p.catch(error => errorCallHandler(error, context, endpoint, opts))
    //     p.context = context
    //     return p
    // }

    // function remoteCall (context, endpoint, opts) {
    //     let promise = transport.request(context)
    //     if (opts.timeout > 0) {
    //         promise = promiseTimeout(opts.timeout, promise, new WeaveRequestTimeoutError(context.action.name, context.nodeId))
    //     }

    //     if (options.circuitBreaker.enabled && endpoint) {
    //         promise = promise.then(result => {
    //             endpoint.success()
    //             return result
    //         })
    //     }
    //     promise = promise.catch(error => errorCallHandler(error, context, endpoint, opts))
    //     promise.context = context
    //     return promise
    // }

    // function errorCallHandler (error, context, endpoint, opts) {
    //     const actionName = context.action.name
    //     const nodeId = context.nodeId

    //     error.context = context

    //     if (options.circuitBreaker.enabled && endpoint && (!error.nodeId || error.nodeId === context.nodeId)) {
    //         endpoint.failure(error)
    //     }

    //     if (error.retryable) {
    //         context.retryCount--
    //         if (context.retryCount > 0) {
    //             state.log.warn(`Retry to call action ${actionName} (${context.retryCount + 1})`)
    //             opts.context = context
    //             return this.call(actionName, context.params, opts)
    //         }
    //     }

    //     if (context.metrics) {
    //         finishCall(context)
    //     }

    //     if (nodeId !== state.nodeId) {
    //         if (transport) {
    //             transport.removePendingRequestsById(context.id)
    //         }
    //     }
    //     log.error(error.message)
    //     return Promise.reject(error)
    // }

    // function finishCall (context) {
    //     if (context.metrics) {
    //         context.metricsFinish(null, context.metrics)
    //     }

    //     if (statistics) {
    //         statistics.addRequest(context.action.name, context.duration)
    //     }
    //     return Promise.resolve()
    // }

    return {
        setContextFactory,
        call
    }
}

module.exports = makeCallUtils
