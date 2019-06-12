/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { isString, isFunction, defaultsDeep } = require('lodash')
const makeMiddleware = require('./_middleware.factory')
const generateCacheKeyFactory = require('./_caching-key-generator.factory')
const generateCacheKey = generateCacheKeyFactory()

const getDefaultOptions = options =>
    defaultsDeep(options, {
        ttl: 3000
    })

const cacheResolverFactory = ({ Cache, Errors }) =>
    opts => {
        const getByName = name => {
            if (!name) {
                return null
            }

            const n = Object.keys(Cache).find(n => n.toLowerCase() === name.toLowerCase())
            if (n) {
                return Cache[n]
            }
        }

        let cacheFactory
        if (opts === true) {
            cacheFactory = Cache.Memory
        } else if (isString(opts)) {
            const cache = getByName(opts)
            if (cache) {
                cacheFactory = cache
            } else {
                throw new Errors.WeaveBrokerOptionsError(`Inknown cache type ${opts}`)
            }
        } else if (isFunction(opts)) {
            cacheFactory = opts
        }
        if (cacheFactory) {
            const cache = cacheFactory({ makeMiddleware, generateCacheKey, getDefaultOptions })
            return cache(opts)
        }
    }

module.exports = cacheResolverFactory
