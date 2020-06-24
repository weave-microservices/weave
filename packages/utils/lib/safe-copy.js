module.exports.safeCopy = function safeCopy (obj) {
  const cache = new WeakSet()
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      /* istanbul ignore next */
      if (cache.has(value)) {
        return
      }
      cache.add(value)
    }
    return value
  }))
}
