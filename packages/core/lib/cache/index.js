/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
const { isString, isFunction } = require('lodash')
const { WeaveBrokerOptionsError } = require('../errors')

const adapters = {
    Memory: require('./memory'),
    Redis: require('./redis')
}

module.exports = {
    adapters,
    resolve (cacheOptions) {
        const getByName = name => {
            if (!name) {
                return null
            }

            const n = Object.keys(adapters).find(n => n.toLowerCase() === name.toLowerCase())
            if (n) {
                return adapters[n]
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
