import { isObject } from './is-object'

export function merge (target: any, source: any): any {
  if (!isObject(target) || !isObject(source)) {
    return source
  }

  const tempTarget = Object.assign({}, target)

  Object.keys(source).forEach(key => {
    const targetValue = tempTarget[key]
    const sourceValue = source[key]

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      tempTarget[key] = targetValue.concat(sourceValue)
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      tempTarget[key] = merge(Object.assign({}, targetValue), sourceValue)
    } else {
      tempTarget[key] = sourceValue
    }
  })

  return tempTarget
}

export function deepMerge (...args): any {
  // Setup target object
  const newObj = {}

  // Merge the object into the newObj object
  const merge = function (obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        // If property is an object, merge properties
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          newObj[prop] = deepMerge(newObj[prop], obj[prop])
        } else if (Array.isArray(newObj[prop]) && Array.isArray(obj[prop])) {
          newObj[prop] = newObj[prop].concat(obj[prop])
        } else {
          newObj[prop] = obj[prop]
        }
      }
    }
  }

  // Loop through each object and conduct a merge
  for (let i = 0; i < args.length; i++) {
    merge(args[i])
  }

  return newObj
}
