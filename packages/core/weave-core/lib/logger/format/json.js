const { format } = require('./format')
const { MESSAGE } = require('../base')
const { safeCopy } = require('@weave-js/utils')

const replacer = (_, value) => {
  if (value instanceof Error) {
    return {
      // Pull all enumerable properties, supporting properties on custom Errors
      ...value,
      // Explicitly pull Error's non-enumerable properties
      name: value.name,
      message: value.message,
      stack: value.stack
    }
  }
  if (value instanceof Buffer) {
    return value.toString('base64')
  }
  if (typeof value === 'bigint') {
    return value.toString()
  }
  return value
}

exports.json = format(({ info, options }) => {
  info[MESSAGE] = JSON.stringify(safeCopy(info), options.replacer || replacer)
  return info
})
