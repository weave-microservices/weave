/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

exports.initMiddlewareHandler = (runtime) => {
  const list = []

  Object.defineProperty(runtime, 'middlewareHandler', {
    value: {
      count () {
        return list.length
      },
      add (middleware) {
        if (!middleware) {
          return
        }

        if (typeof middleware === 'function') {
          middleware = middleware.call(runtime, runtime)
        }

        list.push(middleware)
      },
      wrapMethod (methodName, handler, bindTo = runtime) {
        if (list.length) {
          const middlewareList = list.filter(middleware => !!middleware[methodName])
          if (middlewareList.length) {
            handler = middlewareList.reduce((next, middleware) => middleware[methodName].call(runtime, next), handler.bind(bindTo))
          }
        }
        return handler
      },
      wrapHandler (methodName, handler, definition) {
        if (list.length) {
          handler = list.reduce((handler, middleware) => {
            if (typeof middleware[methodName] === 'function') {
              return middleware[methodName].call(runtime, handler, definition)
            } else {
              return handler
            }
          }, handler)
        }
        return handler
      },
      callHandlersAsync (methodName, args, reverse = false) {
        const middlewareList = reverse ? Array.from(list).reverse() : list
        const momentousHandlers = middlewareList
          .filter(middleware => typeof middleware[methodName] === 'function')
          .map(middleware => middleware[methodName])

        if (momentousHandlers.length) {
          return momentousHandlers.reduce((p, func) => p.then(() => func.apply(runtime, args)), Promise.resolve())
        }

        return Promise.resolve()
      },
      callHandlersSync (methodName, args, reverse = false) {
        if (list.length) {
          const middlewareList = reverse ? Array.from(list).reverse() : list

          middlewareList
            .filter(middleware => typeof middleware[methodName] === 'function')
            .map(middleware => middleware[methodName])
            .forEach(handler => handler.apply(runtime, args))
        }
      }
    }
  })
}
