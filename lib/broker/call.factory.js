const { ServiceNotFoundError, RequestTimeoutError } = require('../errors')
const { promiseTimeout } = require('../utils')

const makeCallUtils = ({ state, log, options, registry, shouldCollectMetrics, statistics }) => {
    let transport = null
    let contextFactory = null

    function setCallTransport (trans) {
        transport = trans
    }

    function setContextFactory (cf) {
        contextFactory = cf
    }

    function call (actionName, params, opts = {}) {
        if (typeof opts.timeout === 'undefined' || opts.timeout === null) {
            opts.timeout = options.requestTimeout || 0
        }

        if (!opts.retryCount) {
            opts.retryCount = state.options.requestRetry || 0
        }

        let endpoint
        // endpoint stellt eine lokale oder remote callback referenz dar.
        // actioname is not a string, so it must be an endpoint.
        if (typeof actionName !== 'string') {
            endpoint = actionName
            actionName = endpoint.action.name
        } else {
            // If a Node ID is passed, try to get a remote endpoint.
            if (opts.nodeId) {
                endpoint = registry.getActionEndpointByNodeId(actionName, opts.nodeId)
                if (!endpoint) {
                    state.log.debug('Service not available')
                    return Promise.reject(new ServiceNotFoundError(actionName, opts.nodeId))
                }
            } else {
                const endpoints = registry.getActionEndpoints(actionName)
                if (!endpoints) {
                    state.log.warn(`Service ${actionName} is not registred.`)
                    return Promise.reject(new ServiceNotFoundError(actionName, opts.nodeId))
                }

                endpoint = endpoints.getNextAvailable()
                if (!endpoint) {
                    state.log.debug('Service not available')
                    return Promise.reject(new ServiceNotFoundError(actionName))
                }
            }
        }

        const action = endpoint.action
        const nodeId = endpoint.node.id
        let context

        state.log.trace(`Call action ${actionName} on node ${nodeId || '<local>'}`)

        if (typeof opts.context !== 'undefined') {
            context = opts.context
            context.nodeId = nodeId
        } else {
            context = contextFactory.create(action, nodeId, params, opts)
        }

        // create context
        if (endpoint.local) {
            return localCall(context, endpoint, opts)
        } else {
            return remoteCall(context, endpoint, opts)
        }
    }

    function localCall (context, endpoint, opts) {
        const action = endpoint.action

        if (context.metrics || statistics) {
            context.metricsStart()
        }

        let result = action.handler(context)

        if (opts.timeout > 0) {
            result = promiseTimeout(opts.timeout, result, new RequestTimeoutError(context.action.name, context.nodeId))
        }

        if (context.metrics || statistics) {
            result.then((res) => {
                finishCall(context)
                return res
            })
        }

        result = result.catch(error => errorCallHandler(error, context, endpoint, opts))
        result.context = context
        return result
    }

    function remoteCall (context, endpoint, opts) {
        let result = transport.request(context)
        if (opts.timeout > 0) {
            result = promiseTimeout(opts.timeout, result, new RequestTimeoutError(context.action.name, context.nodeId))
        }
        result = result.catch(error => errorCallHandler(error, context, endpoint, opts))
        result.context = context
        return result
    }

    function errorCallHandler (error, context, endpoint, opts) {
        const actionName = context.action.name
        const nodeId = context.nodeId

        if (error.retryable) {
            context.retryCount--
            if (context.retryCount > 0) {
                state.log.warn(`Retry to call action ${actionName} (${context.retryCount + 1})`)
                opts.context = context
                return this.call(actionName, context.params, opts)
            }
        }

        if (context.metrics) {
            finishCall(context)
        }

        if (nodeId !== state.nodeId) {
            if (transport) {
                transport.removePendingRequests(context.id)
            }
        }
        log.error(error.message)
        return Promise.reject(error)
    }

    function finishCall (context) {
        if (context.metrics) {
            context.metricsFinish(null, context.metrics)
        }

        if (statistics) {
            statistics.addRequest(context.action.name, context.duration)
        }
        return Promise.resolve()
    }

    return {
        setCallTransport,
        setContextFactory,
        call,
        localCall,
        remoteCall,
        finishCall,
        errorCallHandler
    }
}

module.exports = makeCallUtils
