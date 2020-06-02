
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
