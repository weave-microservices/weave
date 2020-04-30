
module.exports.wrapInArray = object => Array.isArray(object) ? object : [object]

module.exports.flatten = arr => arr.reduce((a, b) => a.concat(b), [])

module.exports.compact = arr => arr.filter(Boolean)

module.exports.isFunction = obj => typeof obj === 'function'

module.exports.clone = function clone (obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  } else if (Array.isArray(obj)) {
    var clonedArr = []
    obj.forEach(function (element) {
      clonedArr.push(clone(element))
    })
    return clonedArr
  } else {
    const clonedObj = {}
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        clonedObj[prop] = clone(obj[prop])
      }
    }
    return clonedObj
  }
}

module.exports.deepMerge = function deepMerge (...args) {
  // Setup target object
  var newObj = {}

  // Merge the object into the newObj object
  var merge = function (obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        // If property is an object, merge properties
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          newObj[prop] = deepMerge(newObj[prop], obj[prop])
        } else {
          newObj[prop] = obj[prop]
        }
      }
    }
  }

  // Loop through each object and conduct a merge
  for (var i = 0; i < args.length; i++) {
    merge(args[i])
  }

  return newObj
}
