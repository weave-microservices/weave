const hrTime = require('./time')
const generateId = require('../utils/uuid')

class Span {
  constructor (tracer, name, options) {
    this.tracer = tracer
    this.options = options

    this.id = options.id || generateId()
    this.traceId = options.traceId || generateId()
    this.parentId = options.parentId
    this.name = name
    this.type = options.type
    this.service = options.service
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
    this.tracer.invokeCollectorMethod('startedSpan', this)
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
    this.tracer.invokeCollectorMethod('finishedSpan', this)

    return this
  }

  setError (error) {
    this.error = error
    return this
  }
}

module.exports = Span
