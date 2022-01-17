const { format } = require('./utils/format')

exports.noop = () => {}

exports.generateLogMethod = (runtime, level, hook) => {
  if (!hook) {
    return log
  }

  return function hookWrappedLog (...args) {
    hook.call(runtime, args, log, level)
  }

  function log (origin, ...n) {
    if (typeof origin === 'object') {
      let message = origin
      let formatParams
      if (message === null && n.length === 0) {
        formatParams = [null]
      } else {
        message = n.shift()
        formatParams = n
      }
      runtime.write(origin, format(message, formatParams, runtime.options.formatOptions), level)
    } else {
      runtime.write(null, format(origin, n, runtime.options.formatOptions), level)
    }
  }
}

exports.coreFixtures = (object) => {
  return object
}
