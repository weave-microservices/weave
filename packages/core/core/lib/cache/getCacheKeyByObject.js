const { isObject, isString } = require('@weave-js/utils')

/**
 * Get property from data or metadata object.
 * @param {any} value Value
 * @returns {string} Cache key
*/
const getCacheKeyByObject = (value) => {
  if (Array.isArray(value)) {
    return '[' + value.map(object => getCacheKeyByObject(object)).join('/') + ']'
  } else if (isObject(value)) {
    return '{' + Object.keys(value).map(key => {
      return [key, getCacheKeyByObject(value[key])].join(':')
    }).join('/') + '}'
  } else if (isString(value)) {
    return value
  } else if (typeof value === 'boolean' || typeof value === 'number') {
    return value.toString()
  } else {
    return 'null'
  }
}

module.exports = { getCacheKeyByObject }
