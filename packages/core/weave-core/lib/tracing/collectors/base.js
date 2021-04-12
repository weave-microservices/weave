const { isObject } = require('@weave-js/utils')

class BaseCollector {
  constructor (options) {
    this.options = options || {}
  }

  initBase (runtime) {
    this.runtime = runtime
    // this.broker = tracer.broker
    // this.log = tracer.log
  }

  startedSpan () {}

  finishedSpan (span) {}

  stop () {}

  flattenTags (obj, convertToString = false, path = '') {
    if (!obj) return null

    return Object.keys(obj).reduce((res, k) => {
      const o = obj[k]
      const pp = (path ? path + '.' : '') + k

      if (isObject(o)) {
        Object.assign(res, this.flattenTags(o, convertToString, pp))
      } else if (o !== undefined) {
        res[pp] = convertToString ? String(o) : o
      }

      return res
    }, {})
  }

  getErrorFields (error, ...fields) {
    if (!error) {
      return null
    }

    const picked = {}

    for (const field of fields) {
      picked[field] = error[field]
    }

    return picked
  }
}

module.exports = BaseCollector
