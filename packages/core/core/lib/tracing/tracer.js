const { resolveCollector } = require('./collectors')
const { createSpan } = require('./span')

module.exports = () => {
  let collectors = []
  let samplingCounter = 0

  return {
    init (broker, options) {
      this.options = options
      this.broker = broker
      this.log = broker.createLogger('Tracer')
      // this.storage = asyncStore()
      // this.storage.enable()

      if (options.enabled) {
        this.log.info('Tracer initialized.')

        if (options.collectors) {
          collectors = options.collectors
            .map(entry => {
              const initCollector = resolveCollector(broker, entry, this)
              // collector.init(this)
              return initCollector()
            })
        }
      }
    },
    async stop () {
      if (collectors) {
        return await Promise.all(collectors.map(collector => collector.stop()))
      }
    },
    shouldSample (span) {
      // check span priority
      if (this.options.samplingRate === 0) {
        return false
      }

      if (this.options.samplingRate === 1) {
        return true
      }

      if (++samplingCounter * this.options.samplingRate >= 1) {
        samplingCounter = 0
        return true
      }

      return false
    },
    invokeCollectorMethod (method, args) {
      collectors.map(collector => collector[method].apply(collector, args))
    },
    startSpan (name, options) {
      const span = createSpan(this, name, Object.assign({
        type: 'custom'
      }, options))

      span.start()

      return span
    }
  }
}
