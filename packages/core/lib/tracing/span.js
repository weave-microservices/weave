const hrTime = require('./time')

class Span {
    constructor (tracer, name, options) {
        this.tracer = tracer
        this.options = options

        this.id = options.id

        this.name = name
        this.tags = {}
        this.error = null
        this.sampled = this.options.sampled ? this.options.sampled : tracer.shouldCollectTracing()

        this.startTime = null
        this.finishTime = null
        this.duration = null

        if (this.options.tags) {
            this.addTags(this.options.tags)
        }
    }

    addTags (tags) {
        Object.assign(this.tags, tags)
        return this
    }

    start (time) {
        this.startTime = time || hrTime()
        this.tracer.invokeCollectorMethod('startSpan', this)
        return this
    }

    startChildSpan (name, options) {
        const parentOptions = {
            parentId: options.parentId,
            sampled: options.sampled
        }
        return this.tracer.startSpan(name, Object.assign(parentOptions, options))
    }

    finish (time) {
        this.finishTime = time || hrTime()
        this.duration = this.finishTime - this.startTime
        this.tracer.log.debug('Span finished')
        this.tracer.invokeCollectorMethod('finishSpan', this)

        return this
    }

    setError (error) {
        this.error = error
        return this
    }
}

module.exports = Span
