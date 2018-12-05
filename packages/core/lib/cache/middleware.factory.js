/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const middelwareFactory = ({ set, get, generateCacheKey }) => {
    return (handler, action) => {
        if (action.cache) {
            return function cacheMiddleware (context) {
                const cacheHashKey = generateCacheKey(action.name, context.params, action.cache.keys)
                context.isCachedResult = false
                return get(cacheHashKey).then((content) => {
                    if (content !== null) {
                        context.isCachedResult = true
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

module.exports = middelwareFactory
