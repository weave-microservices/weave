class BaseCollector {
    constructor (options) {
        this.options = options || {}
    }

    init (tracer) {
        this.tracer = tracer
    }

    startedSpan () {

    }

    finishedSpan (span) {

    }

    flattenObject (object, subobjectsToString = true) {
        return Object.keys(object).reduce((a, b) => {
            
        })
    }
}

module.exports = BaseCollector
