/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

let actionCounter = 0

function shouldCollectTracing (options) {
    if (options.enabled) {
        actionCounter++
        if (actionCounter * options.tracingRate >= 1) {
            actionCounter = 0
            return true
        }
        return false
    }
}

function generateTracingBody (context) {
    const payload = {
        id: context.id,
        nodeId: context.nodeId,
        level: context.level,
        isRemoteCall: !!context.callerNodeId,
        requestId: context.requestId,
        startTime: context.startTime
    }

    if (context.action) {
        payload.action = {
            name: context.action.name
        }
    }

    if (context.parentId) {
        payload.parentId = context.parentId
    }

    if (payload.isRemoteCall) {
        payload.callerNodeId = context.callerNodeId
    }

    return payload
}

function metricsStart (broker, context) {
    context.startTime = Date.now()
    context.startHighResolutionTime = process.hrtime()

    if (context.tracing) {
        const payload = generateTracingBody(context)
        broker.emit('$tracing.trace.span.started', payload)
    }
}

function metricsFinish (broker, context, error) {
    if (context.startHighResolutionTime) {
        const diff = process.hrtime(context.startHighResolutionTime)
        context.duration = (diff[0] * 1e3) + (diff[1] / 1e6) // ms
    }

    const stopTime = context.startTime + context.duration

    if (context.tracing) {
        const payload = generateTracingBody(context)
        payload.stopTime = stopTime
        payload.isCachedResult = !!context.isCachedResult

        if (context.action) {
            payload.action = {
                name: context.action.name
            }
        }

        if (error) {
            payload.error = {
                name: error.name,
                code: error.code,
                type: error.type,
                message: error.message
            }
        }
        broker.emit('tracing.trace.span.finished', payload)
    }
}

const wrapTracingLocalMiddleware = function (handler) {
    const broker = this
    const options = broker.options.tracing || {}

    if (options.enabled) {
        return function metricsLocalMiddleware (context) {
            if (context.tracing == null) {
                context.tracing = shouldCollectTracing(options)
            }
            if (context.tracing) {
                metricsStart(broker, context)
                return handler(context)
                    .then(result => {
                        metricsFinish(broker, context)
                        return result
                    })
                    .catch(error => {
                        metricsFinish(broker, context, error)
                        return Promise.reject(error)
                    })
            }
            return handler(context)
        }
    }
    return handler
}

const wrapTracingRemoteMiddleware = function (handler, action) {
    const broker = this
    const options = broker.options.tracing || {}

    return function metricsRemoteMiddleware (context) {
        if (context.tracing === null) {
            context.tracing = shouldCollectTracing(options)
        }
        return handler(context)
    }
}

module.exports = () => {
    return {
        localAction: wrapTracingLocalMiddleware,
        remoteAction: wrapTracingRemoteMiddleware
    }
}
