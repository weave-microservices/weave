import { isString, isFunction } from "@weave-js/utils";
import type { ActionCacheOptions, ActionHandler, Cache, Context, Middleware, Runtime, ServiceInjection, ParsedAction } from "../../../types/index.js";

interface CacheActionOptions {
  enabled: boolean;
  keys?: string[];
}

export default (runtime: Runtime): Middleware => {
  return {
    localAction: (handler: ActionHandler, action: ParsedAction): ActionHandler => {
      const cacheOptions = runtime.options.cache;
      const cacheActionOptions: CacheActionOptions = {
        enabled: !!action.cache,
      };

      if (isString(action.cache)) {
        cacheActionOptions.keys = action.cache.split(" ");
      } else if (action.cache && typeof action.cache === "object" && Array.isArray((action.cache as ActionCacheOptions).keys)) {
        cacheActionOptions.keys = (action.cache as ActionCacheOptions).keys;
      }

      if (cacheActionOptions.enabled && runtime.cache) {
        const cache: Cache = runtime.cache;
        const actionCacheConfig = action.cache as ActionCacheOptions | undefined;
        const isEnabledFunction = actionCacheConfig && isFunction(actionCacheConfig.condition);

        return function cacheMiddleware(context: Context, serviceInjections: ServiceInjection): Promise<any> {
          // handle enabled function
          if (isEnabledFunction && actionCacheConfig?.condition) {
            if (!actionCacheConfig.condition.call(null, context)) {
              // Enabled function returns "false". Cache is disabled.
              return handler(context, serviceInjections);
            }
          }

          // Generate cache hash
          const cacheHashKey = cache.getCachingKey(
            action.name,
            context.data,
            context.meta,
            cacheActionOptions.keys,
          );

          context.isCachedResult = false;

          // Disable caching by meta property.
          if (context.meta.$noCache === true) {
            return handler(context, serviceInjections);
          }

          // The cache adapter is not connected yet. In this case, we call the handler regular
          if (cache.isConnected === false) {
            cache.log.debug("Cache adapter is not connected yet. Call handler...");
            return handler(context, serviceInjections);
          }

          if (cacheOptions?.lock?.enabled) {
            let cachePromise: Promise<any>;
            if (cacheOptions.lock.staleTime && cache.getWithTTl) {
              // TODO: implement stale time handling
              cachePromise = cache.get(cacheHashKey);
            } else {
              cachePromise = cache.get(cacheHashKey);
            }

            return cachePromise.then((cachedResult) => {
              if (cachedResult !== null) {
                // Found a cached value. Skip calling handler and return our value
                context.isCachedResult = true;
                return cachedResult;
              }

              return cache.lock(cacheHashKey).then((release) => {
                return cache.get(cacheHashKey).then((cachedResult) => {
                  if (cachedResult !== null) {
                    // Found a cached value. Skip calling handler and return our value
                    context.isCachedResult = true;
                    return release().then(() => {
                      return cachedResult;
                    });
                  }

                  return handler(context, serviceInjections)
                    .then((result) => {
                      // Cache the value
                      return cache.set(cacheHashKey, result, actionCacheConfig?.ttl).then(() => {
                        return result;
                      });
                    })
                    .finally(() => {
                      // Always release the lock
                      release();
                    });
                });
              });
            });
          }

          // Not using cache lock
          return cache.get(cacheHashKey).then((cachedResult) => {
            if (cachedResult !== null) {
              context.isCachedResult = true;
              return cachedResult;
            }

            return handler(context, serviceInjections).then((result) => {
              cache.set(cacheHashKey, result, actionCacheConfig?.ttl);
              return result;
            });
          });
        };
      }
      return handler;
    },
  };
};
