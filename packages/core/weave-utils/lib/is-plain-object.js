exports.isPlainObject = function isPlainObject (o, strict = true) {
  if (o === null || o === undefined) {
    return false
  }

  const instanceOfObject = o instanceof Object
  const typeOfObject = typeof o === 'object'
  const constructorUndefined = o.constructor === undefined
  const constructorObject = o.constructor === Object
  const typeOfConstructorObject = typeof o.constructor === 'function'

  let result

  if (strict === true) {
    result = (instanceOfObject || typeOfObject) && (constructorUndefined || constructorObject)
  } else {
    result = (constructorUndefined || typeOfConstructorObject)
  }

  return result
}
