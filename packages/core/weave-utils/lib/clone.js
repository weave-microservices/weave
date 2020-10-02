
exports.clone = function clone (obj) {
  // in case of premitives
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // date objects should be
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  // handle Array
  if (Array.isArray(obj)) {
    var clonedArr = []
    obj.forEach(function (element) {
      clonedArr.push(clone(element))
    })
    return clonedArr
  }

  // lastly, handle objects
  const clonedObj = Object.create(Object.getPrototypeOf(obj))
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      clonedObj[prop] = clone(obj[prop])
    }
  }

  return clonedObj
}
