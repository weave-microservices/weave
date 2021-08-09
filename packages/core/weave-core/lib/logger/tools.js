const os = require('os')
const { format } = require('./utils/format')

exports.noop = () => {}

exports.generateLogMethod = (runtime, level, hook) => {
  if (!hook) {
    return log
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

exports.asJsonString = (runtime, originObj, message, number, time) => {
  const data = {
    level: number,
    time,
    ...runtime.fixtures
  }

  if (message !== undefined) {
    data[runtime.options.messageKey] = message
  }

  const notHasOwnProperty = originObj.hasOwnProperty === undefined

  let value
  for (const key in originObj) {
    value = originObj[key]
    if ((notHasOwnProperty || originObj.hasOwnProperty(key)) && value !== undefined) {
      data[key] = value
    }
  }

  return JSON.stringify(data) + os.EOL
}

exports.coreFixtures = (object) => {
  return object
}
