module.exports.saveCopy = function saveCopy (obj) {
  const cache = new WeakSet()
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return
      }
      cache.add(value)
    }
    return value
  }))
}
