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
            context.setParams(params)

            context.nodeId = nodeId
            context.timeout = opts.timeout || 0
            context.retryCount = opts.retryCount

            // request id
            if (opts.requestId) {
                context.requestId = opts.requestId
            } else if (opts.parentContext && opts.parentContext.requestId) {
                context.requestId = opts.parentContext.requestId
            }

            // meta data
            if (opts.parentContext && opts.parentContext.meta !== null) {
                context.meta = opts.parentContext.meta
            } else if (opts.meta) {
                context.meta = opts.meta
            }

            if (opts.parentContext) {
                context.parentId = opts.parentContext.id
                context.level = opts.parentContext.level + 1
            }

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
            context.nodeId = state.nodeId

            context.id = payload.id
            context.setParams(payload.params)
            context.parentId = payload.parentId
            context.requestId = payload.requestId
            context.timeout = payload.timeout || 0
            context.meta = payload.meta
            context.metrics = payload.metrics
            context.level = payload.level
            context.callerNodeId = payload.sender

            return context
        }
    }
}

module.exports = makeContextFactory
