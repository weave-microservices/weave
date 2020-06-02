
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
