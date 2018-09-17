let actionCounter = 0

function shouldCollectMetrics (state, options) {
    if (options.enabled) {
        actionCounter++
        if (actionCounter * options.metricRate >= 1) {
            actionCounter = 0
            return true
        }
        return false
    }
}

function generateMetricsBody (context) {
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
        payload.callerNodeId = payload.callerNodeId
    }

    return payload
}

function metricsStart (broker, context) {
    context.startTime = Date.now()
    context.startHighResolutionTime = process.hrtime()

    if (context.metrics) {
        const payload = generateMetricsBody(context)
        broker.emit('metrics.trace.span.started', payload)
    }
}

function metricsFinish (internal, context, error) {
    if (context.startHighResolutionTime) {
        const diff = process.hrtime(context.startHighResolutionTime)
        context.duration = (diff[0] * 1e3) + (diff[1] / 1e6) // ms
    }

    const stopTime = context.startTime + context.duration

    if (context.metrics) {
        const payload = generateMetricsBody(context)
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
        internal.emit('metrics.trace.span.finished', payload)
    }
}

const wrapMetricsLocalMiddleware = function (handler, action) {
    const internal = this
    const options = internal.options.metrics || {}

    if (options.enabled) {
        console.log('sadasd')
        return function metricsLocalMiddleware (context) {
            if (context.metrics === null) {
                context.metrics = shouldCollectMetrics(internal.state, options)
            }
            if (context.metrics) {
                metricsStart(internal, context)
                return handler(context)
                    .then(result => {
                        metricsFinish(internal, context)
                        return result
                    })
                    .catch(error => {
                        metricsFinish(internal, context, error)
                        return Promise.reject(error)
                    })
            }
            return handler(context)
        }
    }
    return handler
}

const wrapMetricsRemoteMiddleware = function (handler, action) {
    const internal = this
    const options = internal.options.metrics || {}

    return function metricsRemoteMiddleware (context) {
        if (context.metrics === null) {
            context.metrics = shouldCollectMetrics(internal.state, options)
        }
        return handler(context)
    }
}

module.exports = () => {
    return {
        localAction: wrapMetricsLocalMiddleware,
        remoteAction: wrapMetricsRemoteMiddleware
    }
}
