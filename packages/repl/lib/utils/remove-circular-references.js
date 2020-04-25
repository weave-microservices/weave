function getCircularReplacer () {
  const seen = new WeakSet()
  return (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}

module.exports = function removeCircularReferences (obj) {
  return JSON.parse(JSON.stringify(obj, getCircularReplacer()))
}
