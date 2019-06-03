/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { hash } = require('node-object-hash')({ sort: false, coerce: false })
const { isObject } = require('lodash')

const makeBaseCache = (broker, options) => {
    const baseCache = {
        options: Object.assign({
            ttl: null
        }, options),
        log: broker.createLogger('CACHER'),
        set (hashKey, result, ttl) {
            throw new Error('Method not implemented.')
        },
        get (hashKey) {
            throw new Error('Method not implemented.')
        },
        remove () {
            throw new Error('Method not implemented.')
        },
        clear () {
            throw new Error('Method not implemented.')
        },
        getCachingHash (name, params, keys) {
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
    }

    baseCache.middleware = (handler, action) => {
        if (action.cache) {
            return function cacheMiddleware (context) {
                const cacheHashKey = baseCache.getCachingHash(action.name, context.params, action.cache.keys)
                context.isCachedResult = false
                return baseCache.get(cacheHashKey).then((content) => {
                    if (content !== null) {
                        context.isCachedResult = true
                        return content
                    }
                    return handler(context).then((result) => {
                        baseCache.set(cacheHashKey, result, action.cache.ttl)
                        return result
                    })
                })
            }
        }
        return handler
    }

    return baseCache
}
module.exports = makeBaseCache
