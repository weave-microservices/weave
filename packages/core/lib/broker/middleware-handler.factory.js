/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const makeMiddlwareHandler = (brokerObject) =>
    () => {
        const list = []
        // todo: renaming middlwareDependencies
        let middlwareDependencies = null
        return {
            init (_middlwareDependencies) {
                middlwareDependencies = _middlwareDependencies
            },
            add (middleware) {
                if (!middleware) {
                    return
                }

                if (typeof middleware === 'function') {
                    middleware = {
                        localAction: middleware
                    }
                }

                list.push(middleware)
            },
            wrapHandler (methodName, handler, definition) {
                if (list.length) {
                    handler = list.reduce((handler, middleware) => {
                        if (typeof middleware[methodName] === 'function') {
                            return middleware[methodName].call(middlwareDependencies, handler, definition)
                        } else {
                            return handler
                        }
                    }, handler)
                }
                return handler
            },
            callHandlersAsync (methodName, args, reverse = false) {
                if (list.length) {
                    const middlewareList = reverse ? Array.from(list).reverse() : list
                    const momentousHandlers = middlewareList
                        .filter(middleware => typeof middleware[methodName] === 'function')
                        .map(middleware => middleware[methodName])

                    if (momentousHandlers.length) {
                        momentousHandlers.reduce((p, func) => p.then(() => func.apply(middlwareDependencies, args)), Promise.resolve())
                    }
                }
            },
            callHandlersSync (methodName, args, reverse = false) {
                if (list.length) {
                    const middlewareList = reverse ? Array.from(list).reverse() : list
                    middlewareList
                        .filter(middleware => typeof middleware[methodName] === 'function')
                        .map(middleware => middleware[methodName])
                        .forEach(handler => handler.apply(middlwareDependencies, args))
                }
            }
        }
    }

module.exports = makeMiddlwareHandler
