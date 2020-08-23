/* istanbul ignore file */

const BaseCollector = require('./base')

class ConsoleCollector extends BaseCollector {
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

  startedSpan (span) {
    // const data = this.generateTracePayload(span)
    this.broker.emit(this.options.events.started, span)
  }

  finishedSpan (span) {
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
}

module.exports = ConsoleCollector
