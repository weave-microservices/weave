const { resolveCollector } = require('./collectors')

module.exports = (options) => {
    let collectors = []
    let samplingCointer = 0
    return {
        init (broker, options) {
            this.log = broker.createLogger('Tracer')
            if (options.tracing.enabled) {
                this.log.info('Tracer initialized.')
                collectors = options.tracing.collectors
                    .map(entry => {
                        const collector = resolveCollector(entry, this)
                        collector.init(broker, this)
                    })
            }
        },
        shouldCollectTracing (span) {
            samplingCointer++

            if (options.tracingRate === 1) {
                return false
            }

            if (options.tracingRate === 1) {
                return true
            }

            if (samplingCointer * options.tracingRate >= 1) {
                samplingCointer = 0
                return true
            }
            return false
        },
        invokeMethod (method, args) {
            collectors.map(collector => collector.apply(this, ...args))
        }
    }
}
