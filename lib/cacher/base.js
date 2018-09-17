/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { hash } = require('node-object-hash')({ sort: false, coerce: false })
const { isObject } = require('lodash')

const makeBaseCacher = ({ state, use, bus, getLogger, options }) => {
    return {
        log: getLogger('CACHER'),
        init (state) {
            state.use(this.makeMiddleware())
        },
        getCacheHash (name, params, keys) {
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
}
module.exports = makeBaseCacher
