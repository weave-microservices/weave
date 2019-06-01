const BaseCollector = require('./base')

class EventCollector extends BaseCollector {
    constructor (options) {
        super(options)

        this.options = Object.assign({
            eventName: '$tracing.trace.span'
        })
    }

    init (broker, tracer) {
        super.init(tracer)
        this.broker = broker
    }

    startSpan (span) {

    }

    finishSpan (span) {

    }

    generateTracePayload (span) {
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
}

module.exports = EventCollector
