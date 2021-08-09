const { isObject } = require('../../../../utils/lib')
const { WeaveError } = require('../../errors')

exports.createBaseTracingCollector = (options) => {
  const baseTracingCollector = Object.create(null)

  baseTracingCollector.options = options

  baseTracingCollector.init = (runtime, tracer) => {
    baseTracingCollector.runtime = runtime
    baseTracingCollector.tracer = tracer
  }

  baseTracingCollector.startedSpan = () => {
    throw new WeaveError('not implemented.')
  }

  baseTracingCollector.finishedSpan = () => {
    throw new WeaveError('not implemented.')
  }

  baseTracingCollector.stop = () => {
    throw new WeaveError('not implemented.')
  }

  baseTracingCollector.flattenTags = (obj, convertToString = false, path = '') => {
    if (!obj) {
      return null
    }

    return Object.keys(obj).reduce((res, k) => {
      const o = obj[k]
      const pp = (path ? path + '.' : '') + k

      if (isObject(o)) {
        Object.assign(res, baseTracingCollector.flattenTags(o, convertToString, pp))
      } else if (o !== undefined) {
        res[pp] = convertToString ? String(o) : o
      }

      return res
    }, {})
  }

  baseTracingCollector.getErrorFields = (error, ...fields) => {
    if (!error) {
      return null
    }

    const picked = {}

    for (const field of fields) {
      picked[field] = error[field]
    }

    return picked
  }

  return baseTracingCollector
}
