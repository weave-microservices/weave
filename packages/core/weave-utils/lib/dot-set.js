const { isObject } = require('./is-object')

module.exports.dotSet = (object, key, value) => {
  if (key.includes('.')) {
    const pathArray = key.split('.')
    return pathArray.reduce((obj, i, index) => {
      const isTargetProp = (index + 1) === pathArray.length
      const currentIsObject = isObject(obj[i])

      if (obj[i] === undefined && !isTargetProp) {
        obj[i] = {}
      } else if (!isTargetProp && currentIsObject) {
        return obj[i]
      } else if (isTargetProp) {
        obj[i] = value
      } else {
        throw new Error(`The property "${i}" already exists and is not an object.`)
      }
      return obj[i]
    }, object)
  }

  object[key] = value
  return object
}
