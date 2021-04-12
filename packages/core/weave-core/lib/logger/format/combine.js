const { format } = require('./format')

const reduce = (formatters) => {
  return ({ info }) => {
    const t = formatters.reduce((a, format) => {
      return format.transform(a, format.options)
    }, info)
    return t
  }
}

exports.combine = (...formatters) => {
  const combinedFormat = format(reduce(formatters))
  const instance = combinedFormat()
  return instance
}
