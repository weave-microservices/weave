const { hash } = require('node-object-hash')({ sort: false, coerce: false })
const { defaultsDeep, isObject } = require('lodash')

const generateCacheKey = (name, params, keys) => {
    if (params) {
        const prefix = `${name}:`
        if (keys) {
            if (keys.length === 1) {
                const value = params[keys[0]]
                return prefix + (isObject(value) ? hash(value) : value)
            }
            if (keys.length > 0) {
                const res = keys.reduce((p, key, i) => {
                    const value = params[key]
                    return p + (i ? '|' : '') + (isObject(value) ? hash(value) : value)
                }, prefix)
                return res
            }
        } else {
            return prefix + hash(params)
        }
    }
    return name
}

const getDefaultOptions = (options) =>
    defaultsDeep(options, {
        ttl: 3000
    })

const makeMiddleware = ({ set, get, generateCacheKey }) => {
    return (handler, action) => {
        if (action.cache) {
            return (context) => {
                const cacheHashKey = generateCacheKey(action.name, context.params, action.cache.keys)
                return get(cacheHashKey).then((content) => {
                    if (content !== null) {
                        context.cachedResult = true
                        return content
                    }
                    return handler(context).then((result) => {
                        set(cacheHashKey, result, action.cache.ttl)
                        return result
                    })
                })
            }
        }
        return handler
    }
}

module.exports = {
    Memory: require('./memory.js').bind(null, {
        makeMiddleware,
        generateCacheKey,
        getDefaultOptions
    }),
    Redis: require('./redis').bind(null, {
        makeMiddleware,
        generateCacheKey,
        getDefaultOptions
    })
}
