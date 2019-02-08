/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

function callHook (hook, service, context, result) {
    if (typeof hook === 'function') {
        return hook.call(service, context, result)
    } else if (Array.isArray(hook)) {
        return hook.reduce((promise, fn) => promise.then(res => fn.call(service, context, res)), Promise.resolve(result))
    }
}

function sanitizeHooks (hooks, service) {
    if (typeof hooks === 'string') {
        hooks = hooks.split(' ')
    }
    if (Array.isArray(hooks)) {
        return hooks.map((hook) => {
            if (typeof hook === 'string') {
                return (service && typeof service[hook] === 'function') ? service[hook] : null
            }
            return hook
        })
    }
    return hooks
}

const makeActionHookMiddleware = () =>
    (handler, action) => {
        const name = action.shortName
        const hooks = (action.service && action.service.schema) ? action.service.schema.hooks : null

        if (hooks) {
            const beforeWildcardHook = hooks.before ? sanitizeHooks(hooks.before['*'], action.service) : null
            const afterWildcardHook = hooks.after ? sanitizeHooks(hooks.after['*'], action.service) : null
            const errorWildcardHook = hooks.error ? sanitizeHooks(hooks.error['*'], action.service) : null

            const beforeHook = hooks.before ? sanitizeHooks(hooks.before[name], action.service) : null
            const afterHook = hooks.after ? sanitizeHooks(hooks.after[name], action.service) : null
            const errorHook = hooks.error ? sanitizeHooks(hooks.error[name], action.service) : null

            if (beforeWildcardHook || afterWildcardHook || errorWildcardHook || beforeHook || afterHook || errorHook) {
                return function actionHookMiddleware (context) {
                    let promise = Promise.resolve()
                    // before all hook
                    if (beforeWildcardHook) {
                        promise = promise.then(() => callHook(beforeWildcardHook, action.service, context))
                    }
                    // before hook
                    if (beforeHook) {
                        promise = promise.then(() => callHook(beforeHook, action.service, context))
                    }
                    // call action handler
                    promise = promise.then(() => handler(context))

                    // after hook
                    if (afterHook) {
                        promise = promise.then(result => callHook(afterHook, action.service, context, result))
                    }

                    if (afterWildcardHook) {
                        promise = promise.then(result => callHook(afterWildcardHook, action.service, context, result))
                    }

                    if (errorHook) {
                        promise = promise.catch(error => callHook(errorHook, action.service, context, error))
                    }

                    if (errorWildcardHook) {
                        promise = promise.catch(error => callHook(errorWildcardHook, action.service, context, error))
                    }
                    return promise
                }
            }
        }
        return handler
    }
module.exports = makeActionHookMiddleware
