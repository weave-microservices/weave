/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { promiseTimeout } from "@weave-js/utils";
import { WeaveRequestTimeoutError } from "../../errors.mts";
import type { ActionHandler, Context, Middleware, Runtime, ServiceInjection } from "../../../types/index.js";

const wrapTimeoutMiddleware = function (this: Runtime, handler: ActionHandler): ActionHandler {
  const self = this;
  const registryOptions = self.options.registry || {};

  return function timeoutMiddleware(context: Context, serviceInjections: ServiceInjection) {
    if (typeof context.options.timeout === "undefined" || registryOptions.requestTimeout) {
      context.options.timeout = registryOptions.requestTimeout || 0;
    }

    if (context.options.timeout > 0 && !context.startHighResolutionTime) {
      context.startHighResolutionTime = process.hrtime();
    }

    let promise = handler(context, serviceInjections);

    if (context.options.timeout > 0) {
      promise = promiseTimeout(
        context.options.timeout,
        promise,
        new WeaveRequestTimeoutError(context.action.name, context.nodeId, context.options.timeout),
      ).catch((error) => {
        if (error instanceof WeaveRequestTimeoutError) {
          self.log.warn(`Request '${context.action.name}' timed out.`);
        }

        return Promise.reject(error);
      });
    }
    return promise;
  };
};

export default (): Middleware => {
  return {
    localAction: wrapTimeoutMiddleware,
    remoteAction: wrapTimeoutMiddleware,
  };
};
