class BaseCollector {
    constructor (options) {
        this.options = options || {}
    }

    init (tracer) {
        this.tracer = tracer
    }

    finishSpan (span) {

    }
}

module.exports = BaseCollector
