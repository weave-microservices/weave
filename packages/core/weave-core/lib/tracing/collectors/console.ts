/* istanbul ignore file */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'BaseCollec... Remove this comment to see the full error message
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
    super.initBase(tracer)
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
}
module.exports = ConsoleCollector
