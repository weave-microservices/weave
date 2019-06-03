const BaseCollector = require('./base')

class EventCollector extends BaseCollector {
    constructor (options) {
        super(options)

        this.options = Object.assign({
            events: {
                started: '$tracing.trace.span.started',
                finished: '$tracing.trace.span.finished'
            },
            broadcast: false
        })
    }

    init (broker, tracer) {
        super.init(tracer)
        this.broker = broker
    }

    startSpan (span) {
        // const data = this.generateTracePayload(span)
        this.broker.emit(this.options.events.started, span)
    }

    finishSpan (span) {
        // const data = this.generateTracePayload(span)
        this.broker.emit(this.options.events.finished, span)
    }

    // generateTracePayload (span) {
    //     const payload = {
    //         id: context.id,
    //         nodeId: context.nodeId,
    //         level: context.level,
    //         isRemoteCall: !!context.callerNodeId,
    //         requestId: context.requestId,
    //         startTime: span.startTime
    //     }

    //     if (context.action) {
    //         payload.action = {
    //             name: context.action.name
    //         }
    //     }

    //     if (context.parentId) {
    //         payload.parentId = context.parentId
    //     }

    //     if (payload.isRemoteCall) {
    //         payload.callerNodeId = context.callerNodeId
    //     }

    //     return payload
    // }
    
/*



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
    }*/
}

module.exports = EventCollector
