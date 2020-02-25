const { resolveCollector } = require('./collectors')
const Span = require('./span')

module.exports = () => {
  let collectors = []
  let samplingCounter = 0
  return {
    init (broker, options) {
      this.options = options
      this.log = broker.createLogger('Tracer')
      // this.storage = asyncStore()
      // this.storage.enable()

      if (options.enabled) {
        this.log.info('Tracer initialized.')
        collectors = options.collectors
          .map(entry => {
            const collector = resolveCollector(entry, this)
            collector.init(broker, this)
            return collector
          })
      }
    },
    shouldCollectTracing (span) {
      samplingCounter++

      if (this.options.samplingRate === 1) {
        return false
      }

      if (this.options.samplingRate === 1) {
        return true
      }

      if (samplingCounter * this.options.samplingRate >= 1) {
        samplingCounter = 0
        return true
      }
      return false
    },
    invokeCollectorMethod (method, args) {
      collectors.map(collector => collector[method](args))
    },
    startSpan (name, options) {
      const span = new Span(this, name, Object.assign({
        type: 'custom'

      }, options))

      span.start()

      return span
    }
  }
}
