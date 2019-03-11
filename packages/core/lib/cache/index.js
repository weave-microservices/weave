/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
const { isString, isFunction, defaultsDeep } = require('lodash')
const makeMiddleware = require('./middleware.factory')
const generateCacheKeyFactory = require('./caching-key-generator.factory')
const generateCacheKey = generateCacheKeyFactory()
const { WeaveBrokerOptionsError } = require('../errors')

module.exports = {
    Memory: require('./memory'),
    Redis: require('./redis'),
    resolve (cacheOptions) {
        const getByName = name => {
            if (!name) {
                return null
            }

            const n = Object.keys(this).find(n => n.toLowerCase() === name.toLowerCase())
            if (n) {
                return this.Cache[n]
            }
        }

        let cacheFactory
        if (cacheOptions === true) {
            cacheFactory = this.Memory
        } else if (isString(cacheOptions)) {
            const cache = getByName(cacheOptions)
            if (cache) {
                cacheFactory = cache
            } else {
                throw new WeaveBrokerOptionsError(`Inknown cache type ${cacheOptions}`)
            }
        } else if (isFunction(cacheOptions)) {
            cacheFactory = cacheOptions
        }
        if (cacheFactory) {
            // const cache = cacheFactory({ makeMiddleware, generateCacheKey, getDefaultOptions })
            return cacheFactory
        }
    }
}
