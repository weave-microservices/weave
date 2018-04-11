const { hash } = require('node-object-hash')({ sort: false, coerce: false })
const { isObject } = require('lodash')

const makeBaseCacher = ({ state, use, bus, getLogger, options }) => {
    return {
        log: getLogger('CACHER'),
        init (state) {
            state.use(this.makeMiddleware())
            state.localEventBus.on('cache.clean', payload => {
                if (Array.isArray(payload)) {

                } else {
                    this.clean(payload)
                }
            })
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

// class BaseCacher {
//     constructor (options) {
//         this.options = defaultsDeep(options, {
//             ttl: 3000
//         })
//     }

//     init (state) {
//         this.logger = state.getLogger('CACHER')
//         state.base.use(this.makeMiddleware())
//         state.localEventBus.on('cache.clean', payload => {
//             if (Array.isArray(payload)) {

//             } else {
//                 this.clean(payload)
//             }
//         })
//     }

//     getCacheHash (name, params, keys) {
//         if (params) {
//             const prefix = `${name}:`
//             if (keys) {
//                 if (keys.length === 1) {
//                     const value = params[keys[0]]
//                     return prefix + (isObject(value) ? hash(value) : value)
//                 }
//                 if (keys.length > 0) {
//                     const res = keys.reduce((p, key, i) => {
//                         const value = params[key]
//                         return p + (i ? '|' : '') + (isObject(value) ? hash(value) : value)
//                     }, prefix)
//                     return res
//                 }
//             } else {
//                 return prefix + hash(params)
//             }
//         }
//         return name
//     }

//     makeMiddleware () {
//         const self = this
//         return (handler, action) => {
//             if (action.cache) {
//                 return (context) => {
//                     const cacheHashKey = this.getCacheHash(action.name, context.params, action.cache.keys)
//                     return this.get(cacheHashKey).then((content) => {
//                         if (content !== null) {
//                             context.cachedResult = true
//                             return content
//                         }
//                         return handler(context).then((result) => {
//                             self.set(cacheHashKey, result, action.cache.ttl)
//                             return result
//                         })
//                     })
//                 }
//             }
//             return handler
//         }
//     }
// }
module.exports = makeBaseCacher
