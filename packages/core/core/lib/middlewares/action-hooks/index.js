/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */

function callHook (hook, service, context, result) {
  if (typeof hook === 'function') {
    return hook.call(service, context, result)
  } else if (Array.isArray(hook)) {
    return hook.reduce(
      (promise, fn) => promise.then(res => fn.call(service, context, res)),
      Promise.resolve(result))
  }
}

function callErrorHook (hook, service, context, error) {
  if (typeof hook === 'function') {
    return hook.call(service, context, error)
  } else if (Array.isArray(hook)) {
    return hook.reduce(
      (promise, fn) => promise.catch(err => fn.call(service, context, err)),
      Promise.reject(error))
  }
}

function sanitizeHooks (hooks, service) {
  if (typeof hooks === 'string') {
    hooks = hooks.split(' ')
  }

  if (Array.isArray(hooks)) {
    return hooks.map((hook) => {
      // resolve the method name
      if (typeof hook === 'string') {
        return (service && typeof service[hook] === 'function') ? service[hook] : null
      }
      return hook
    })
  }
  return hooks
}

const makeActionHookMiddleware = function (handler, action) {
  const name = action.shortName
  const hooks = (action.service && action.service.schema) ? action.service.schema.hooks : null

  if (hooks || action.hooks) {
    // Wildcard hooks
    const beforeWildcardHook = hooks && hooks.before ? sanitizeHooks(hooks.before['*'], action.service) : null
    const afterWildcardHook = hooks &&  hooks.after ? sanitizeHooks(hooks.after['*'], action.service) : null
    const errorWildcardHook = hooks && hooks.error ? sanitizeHooks(hooks.error['*'], action.service) : null

    // Action name-related hooks
    const beforeHook = hooks && hooks.before ? sanitizeHooks(hooks.before[name], action.service) : null
    const afterHook = hooks && hooks.after ? sanitizeHooks(hooks.after[name], action.service) : null
    const errorHook = hooks && hooks.error ? sanitizeHooks(hooks.error[name], action.service) : null

    // Hooks in action definition
    const actionBeforeHook = action.hooks && action.hooks.before ? sanitizeHooks(action.hooks.before, action.service) : null
    const actionAfterHook = action.hooks && action.hooks.after ? sanitizeHooks(action.hooks.after, action.service) : null
    const actionErrorHook = action.hooks && action.hooks.error ? sanitizeHooks(action.hooks.error, action.service) : null

    if (
      beforeWildcardHook ||
      afterWildcardHook ||
      errorWildcardHook ||
      beforeHook ||
      afterHook ||
      errorHook ||
      actionBeforeHook ||
      actionAfterHook ||
      actionErrorHook
    ) {
      return function actionHookMiddleware (context, serviceInjections) {
        let promise = Promise.resolve()

        // before all hook
        if (beforeWildcardHook) {
          promise = promise.then(() => callHook(beforeWildcardHook, action.service, context))
        }

        // Before hook
        if (beforeHook) {
          promise = promise.then(() => callHook(beforeHook, action.service, context))
        }

        // Before hook
        if (actionBeforeHook) {
          promise = promise.then(() => callHook(actionBeforeHook, action.service, context))
        }

        // Call action handler
        promise = promise.then(() => handler(context, serviceInjections))

        // After hook in action definition
        if (actionAfterHook) {
          promise = promise.then(result => callHook(actionAfterHook, action.service, context, result))
        }

        // After hook
        if (afterHook) {
          promise = promise.then(result => callHook(afterHook, action.service, context, result))
        }

        // After wildcard hook
        if (afterWildcardHook) {
          promise = promise.then(result => callHook(afterWildcardHook, action.service, context, result))
        }
        
        // Error hooks
        // Error hook in action definition
        if (actionErrorHook) {
          promise = promise.catch(error => {
            callErrorHook(actionErrorHook, action.service, context, error)
          })
        }
  
        // Error hook
        if (errorHook) {
          promise = promise.catch(error => callErrorHook(errorHook, action.service, context, error))
        }

        // Error wildcard hook
        if (errorWildcardHook) {
          promise = promise.catch(error => callErrorHook(errorWildcardHook, action.service, context, error))
        }

        return promise
      }
    }
  }
  return handler
}

module.exports = () => {
  return {
    localAction: makeActionHookMiddleware
  }
}
