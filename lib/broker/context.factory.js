/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const makeContextFactory = ({
    state,
    Context,
    shouldCollectMetrics
}) => {
    return {
        create (action, nodeId, params, opts) {
            const context = Context(action)
            opts = opts || {}
            context.nodeId = nodeId
            context.timeout = opts.timeout || 0
            context.retryCount = opts.retryCount

            // meta data
            if (opts.parentContext && opts.parentContext.meta !== null) {
                context.meta = opts.parentContext.meta
            } else if (opts.meta) {
                context.meta = opts.meta
            }

            if (opts.parentContext) {
                context.level = opts.parentContext.level + 1
                context.parentRequestId = opts.parentContext.requestId
            }

            context.setParams(params)

            if (opts.parentContext && opts.parentContext.metrics) {
                context.metrics = opts.parentContext.metrics
            } else {
                context.metrics = shouldCollectMetrics()
            }

            if (context.metrics || context.nodeId !== state.nodeId) {
                context.generateId()
                if (!context.requestId) {
                    context.requestId = context.id
                }
            }

            return context
        },
        createFromPayload (payload) {
            const context = Context({ name: payload.action })

            context.id = payload.id
            context.setParams(payload.params)
            context.timeout = payload.timeout || 0
            context.meta = payload.meta
            context.metrics = payload.metrics
            context.callerNodeId = payload.sender

            return context
        }
    }
}

module.exports = makeContextFactory
