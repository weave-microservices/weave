/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { delay } from "@weave-js/utils";
import type {
  ActionHandler,
  Context,
  Middleware,
  RetryPolicyOptions,
  Runtime,
  ServiceInjection,
  WeaveAction,
} from "../../../types/index.js";

interface RetryableError extends Error {
  retryable?: boolean;
}

const wrapRetryMiddleware = function (this: Runtime, handler: ActionHandler, action: WeaveAction): ActionHandler {
  const self = this;
  const options: RetryPolicyOptions = Object.assign({}, self.options.retryPolicy, action.retryPolicy ?? {});

  // middleware is enabled
  if (options.enabled) {
    const retries = options.retries ?? 0;
    const delayMs = options.delay ?? 0;

    // Return middlware handler
    return function retryMiddleware(context: Context, serviceInjections: ServiceInjection): Promise<unknown> {
      // if the context has no repeat count, set it to zero.
      if (context.retryCount === undefined) {
        context.retryCount = 0;
      }

      const attempts =
        typeof context.options.retries === "number" ? context.options.retries : retries;

      return handler(context, serviceInjections).catch((err: unknown) => {
        const error = err as RetryableError;
        if (context.retryCount !== undefined && context.retryCount++ < attempts && error.retryable === true) {
          self.log.warn(`Retry to recall action '${context.action?.name}' after ${delayMs}.`);
          return delay(delayMs).then(() =>
            self.call(context.action?.name ?? "", context.data, { context }),
          );
        }
        return Promise.reject(error);
      });
    };
  }
  return handler;
};

export default (): Middleware => {
  return {
    localAction: wrapRetryMiddleware,
    remoteAction: wrapRetryMiddleware,
  };
};
