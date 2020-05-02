/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

// node modules
const os = require('os')
const { defaultsDeep, uniqWith, compact, flatten } = require('lodash')
const { yellow, bold } = require('kleur')

const uuid = require('./utils/uuid')

const RegexCache = new Map()
const deprecatedList = []

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

module.exports = {
  removeCircularReferences (obj) {
    return JSON.parse(JSON.stringify(obj, getCircularReplacer()))
  },
  isPlainObject (o, strict = true) {
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
  },
  generateToken () {
    return uuid()
  },
  createNodeId () {
    return `${os.hostname()}-${process.pid}`
  },
  mergeSchemas (mixinSchema, serviceSchema) {
    function updateProp (propName, target, source) {
      if (source[propName] !== undefined) {
        target[propName] = source[propName]
      }
    }

    // const flatten = arr => arr.reduce((a, b) => a.concat(b), [])
    // const compact = arr => arr.filter(Boolean)

    function mergeHook (parentValue, childValue) {
      if (childValue) {
        if (parentValue) {
          if (Array.isArray(parentValue)) {
            return parentValue.concat(childValue)
          } else {
            return [parentValue, childValue]
          }
        } else {
          if (Array.isArray(childValue)) {
            return childValue
          } else {
            return [childValue]
          }
        }
      }

      return childValue
        ? Array.isArray(parentValue)
          ? parentValue.concat(childValue)
          : Array.isArray(childValue)
            ? childValue
            : [childValue]
        : parentValue
    }

    const result = Object.assign({}, mixinSchema)
    const schema = Object.assign({}, serviceSchema)

    Object.keys(schema).forEach(key => {
      if (['settings', 'meta'].includes(key)) {
        result[key] = defaultsDeep(schema[key], result[key])
      } else if (['actions', 'events', 'methods'].includes(key)) {
        result[key] = Object.assign(result[key], schema[key])
      } else if (['started', 'stopped', 'created'].includes(key)) {
        if ((typeof result[key] === 'function' || Array.isArray(result[key])) && (typeof schema[key] === 'function' || Array.isArray(schema[key]))) {
          result[key] = mergeHook(result[key], schema[key])
        } else {
          result[key] = schema[key]
        }
      } else if (['mixins', 'dependencies'].includes(key)) {
        result[key] = uniqWith(compact(flatten([schema[key], result[key]])))
      } else {
        updateProp(key, result, schema)
      }
    })

    return result
  },
  bytesToSize (bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Byte'
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
  },
  promiseTimeout (ms, promise, error = null) {
    let id
    const timeout = new Promise((resolve, reject) => {
      id = setTimeout(() => {
        clearTimeout(id)
        reject(error)
      }, ms)
    })
    // Returns a race between our timeout and the passed in promise
    return Promise.race([
      promise,
      timeout
    ]).then((result) => {
      clearTimeout(id)
      return result
    })
  },
  promiseDelay (promise, ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(promise)
      }, ms)
    })
  },
  delay: ms => new Promise(_ => setTimeout(_, ms)),
  saveCopy (obj) {
    const cache = new WeakSet()
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return
        }
        cache.add(value)
      }
      return value
    }))
  },
  deprecated (prop, msg, colored = true) {
    if (!msg) {
      msg = prop
    }

    if (deprecatedList.indexOf(prop) === -1) {
      if (colored) {
        /* istanbul ignore next */
        console.warn(yellow(bold(`Deprecation warning: ${msg}`)))
      } else {
        console.warn(`Deprecation warning: ${msg}`)
      }
      deprecatedList.push(prop)
    }
  },
  getIpList () {
    const list = []
    const interfaces = os.networkInterfaces()
    for (const iface in interfaces) {
      for (const i in interfaces[iface]) {
        const f = interfaces[iface][i]
        if (f.family === 'IPv4' && !f.internal) {
          list.push(f.address)
          break
        }
      }
    }
    return list
  },
  match (text, pattern) {
    if (pattern.indexOf('?') === -1) {
      const firstStarPosition = pattern.indexOf('*')
      if (firstStarPosition === -1) {
        return pattern === text
      }

      const len = pattern.length
      if (len > 2 && pattern.endsWith('**') && firstStarPosition > len - 3) {
        pattern = pattern.substring(0, len - 2)
        return text.startsWith(pattern)
      }

      // Eg. 'prefix*'
      if (len > 1 && pattern.endsWith('*') && firstStarPosition > len - 2) {
        pattern = pattern.substring(0, len - 1)
        if (text.startsWith(pattern)) {
          return text.indexOf('.', len) === -1
        }
        return false
      }
      if (len === 1 && firstStarPosition === 0) {
        return text.indexOf('.') === -1
      }

      if (len === 2 && firstStarPosition === 0 && pattern.lastIndexOf('*') === 1) {
        return true
      }
    }

    let regex = RegexCache.get(pattern)
    if (regex == null) {
      if (pattern.startsWith('$')) {
        pattern = '\\' + pattern
      }
      pattern = pattern.replace(/\?/g, '.')
      pattern = pattern.replace(/\*\*/g, '.+')
      pattern = pattern.replace(/\*/g, '[^\\.]+')

      pattern = '^' + pattern + '$'

      regex = new RegExp(pattern, 'g')
      RegexCache.set(pattern, regex)
    }
    return regex.test(text)
  }
}
