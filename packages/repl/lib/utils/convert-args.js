module.exports = function convertArgs (args) {
  const res = {}

  Object.keys(args).forEach(key => {
    const value = args[key]
    if (Array.isArray(value)) {
      res[key] = value
    } else if (typeof (value) === 'object') {
      res[key] = this.convertArgs(value)
    } else if (value === 'true') {
      res[key] = true
    } else if (value === 'false') {
      res[key] = false
    } else {
      res[key] = value
    }
  })

  return res
}
