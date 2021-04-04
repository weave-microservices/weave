const { format } = require('./format')

const replacer = (_, value) => {
  if (value instanceof Buffer) {
    return value.toString('base64')
  }
  if (typeof value === 'bigint') {
    return value.toString()
  }
  return value
}

exports.json = (options = {}) => format(({ info }) => {
  info.message = JSON.stringify(info, options.replacer || replacer)
  return info
})
