const { isObject, pick } = require('@weave-js/utils')

exports.createBaseTracingCollector = (runtime) => {
  const baseTracingCollector = Object.create(null)

  baseTracingCollector.options = runtime.tracer.options

  baseTracingCollector.init = (runtime) => {
    baseTracingCollector.runtime = runtime
    baseTracingCollector.tracer = runtime.tracer
  }

  baseTracingCollector.startedSpan = () => {
    // throw new WeaveError('not implemented.')
  }

  baseTracingCollector.finishedSpan = () => {
    // throw new WeaveError('not implemented.')
  }

  baseTracingCollector.stop = () => {
    // throw new WeaveError('not implemented.')
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

  baseTracingCollector.getErrorFields = (err, fields) => {
    if (!err) {
      return null
    }
    return pick(err, fields)
  }

  return baseTracingCollector
}
