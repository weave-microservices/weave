/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */
import type { ActionHandler, Context, Middleware, Service, ServiceInjection, ParsedAction } from "../../../types/index.js";

function callHook(hook: Function | Function[], service: Service, context: Context, result?: any): Promise<any> | undefined {
  if (typeof hook === "function") {
    return hook.call(service, context, result);
  } else if (Array.isArray(hook)) {
    return hook.reduce<Promise<any>>(
      (promise, fn) => promise.then((res) => fn.call(service, context, res)),
      Promise.resolve(result),
    );
  }
}

function callErrorHook(hook: Function | Function[], service: Service, context: Context, error: Error): Promise<any> | undefined {
  if (typeof hook === "function") {
    return hook.call(service, context, error);
  } else if (Array.isArray(hook)) {
    return hook.reduce<Promise<any>>(
      (promise, fn) => promise.catch((err) => fn.call(service, context, err)),
      Promise.reject(error),
    );
  }
}

type HookDefinition = string | Function | (string | Function)[];

function sanitizeHooks(hooks: HookDefinition | undefined, service: Service): Function | Function[] | null {
  if (typeof hooks === "string") {
    hooks = hooks.split(" ");
  }

  if (Array.isArray(hooks)) {
    return hooks.map((hook) => {
      // resolve the method name
      if (typeof hook === "string") {
        const method = (service as unknown as Record<string, unknown>)[hook];
        return typeof method === "function" ? method : null;
      }
      return hook;
    }).filter((hook): hook is Function => hook !== null);
  }

  if (typeof hooks === "function") {
    return hooks;
  }

  return null;
}

export default (): Middleware => {
  return {
    localAction: (handler: ActionHandler, action: ParsedAction): ActionHandler => {
      const name = action.shortName;
      const hooks = action.service && action.service.schema ? action.service.schema.hooks : null;
    
      if (hooks || action.hooks) {
        // Wildcard hooks
        const beforeWildcardHook =
          hooks && hooks.before ? sanitizeHooks(hooks.before["*"], action.service) : null;
        const afterWildcardHook =
          hooks && hooks.after ? sanitizeHooks(hooks.after["*"], action.service) : null;
        const errorWildcardHook =
          hooks && hooks.error ? sanitizeHooks(hooks.error["*"], action.service) : null;
    
        // Action name-related hooks
        const beforeHook =
          hooks && hooks.before ? sanitizeHooks(hooks.before[name], action.service) : null;
        const afterHook =
          hooks && hooks.after ? sanitizeHooks(hooks.after[name], action.service) : null;
        const errorHook =
          hooks && hooks.error ? sanitizeHooks(hooks.error[name], action.service) : null;
    
        // Hooks in action definition
        const actionBeforeHook =
          action.hooks && action.hooks.before
            ? sanitizeHooks(action.hooks.before, action.service)
            : null;
        const actionAfterHook =
          action.hooks && action.hooks.after ? sanitizeHooks(action.hooks.after, action.service) : null;
        const actionErrorHook =
          action.hooks && action.hooks.error ? sanitizeHooks(action.hooks.error, action.service) : null;
    
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
          return function actionHookMiddleware(context: Context, serviceInjections: ServiceInjection) {
            let promise = Promise.resolve();
    
            // before all hook
            if (beforeWildcardHook) {
              promise = promise.then(() => callHook(beforeWildcardHook, action.service, context));
            }
    
            // Before hook
            if (beforeHook) {
              promise = promise.then(() => callHook(beforeHook, action.service, context));
            }
    
            // Before hook
            if (actionBeforeHook) {
              promise = promise.then(() => callHook(actionBeforeHook, action.service, context));
            }
    
            // Call action handler
            promise = promise.then(() => handler(context, serviceInjections));
    
            // After hook in action definition
            if (actionAfterHook) {
              promise = promise.then((result) =>
                callHook(actionAfterHook, action.service, context, result),
              );
            }
    
            // After hook
            if (afterHook) {
              promise = promise.then((result) => callHook(afterHook, action.service, context, result));
            }
    
            // After wildcard hook
            if (afterWildcardHook) {
              promise = promise.then((result) =>
                callHook(afterWildcardHook, action.service, context, result),
              );
            }
    
            // Error hooks
            // Error hook in action definition
            if (actionErrorHook) {
              promise = promise.catch((error) =>
                callErrorHook(actionErrorHook, action.service, context, error),
              );
            }
    
            // Error hook
            if (errorHook) {
              promise = promise.catch((error) =>
                callErrorHook(errorHook, action.service, context, error),
              );
            }
    
            // Error wildcard hook
            if (errorWildcardHook) {
              promise = promise.catch((error) =>
                callErrorHook(errorWildcardHook, action.service, context, error),
              );
            }
    
            return promise;
          };
        }
      }
      return handler;
    },
  }
};
