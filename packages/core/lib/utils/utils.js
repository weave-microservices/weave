
module.exports.wrapInArray = object => Array.isArray(object) ? object : [object]

module.exports.flatten = arr => arr.reduce((a, b) => a.concat(b), [])

module.exports.compact = arr => arr.filter(Boolean)

module.exports.cloneObject = (obj) => {
    const clone = {}
    for (var i in obj) {
      if (obj[i] != null && typeof obj[i] === 'object') {
        clone[i] = cloneObject(obj[i])
      } else {
        clone[i] = obj[i]
      }
    }
  
    return clone
  }