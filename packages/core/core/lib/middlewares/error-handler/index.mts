/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { WeaveError } from "../../errors.mts";
import type {
  ActionHandler,
  Context,
  EventHandler,
  Middleware,
  Runtime,
  ServiceInjection,
} from "../../../types/index.js";

export default (runtime: Runtime): Middleware => {
  const wrapErrorHandlerMiddleware = function (handler: ActionHandler): ActionHandler {
    return function errorHandlerMiddleware(
      context: Context,
      serviceInjections: ServiceInjection,
    ): Promise<unknown> {
      return handler(context, serviceInjections).catch((err: unknown) => {
        const error = err instanceof Error ? err : new WeaveError(String(err));

        if (runtime.nodeId !== context.nodeId && context.id) {
          runtime.transport?.removePendingRequestsById(context.id);
        }

        Object.defineProperty(error, "context", {
          value: context,
          writable: true,
          enumerable: false,
        });

        runtime.log.debug(`The action "${context.action?.name}" was rejected`, {
          requestId: context.requestId,
          error,
        });
        return runtime.handleError(error);
      });
    };
  };

  const wrapEventErrorHandlerMiddleware = function (handler: EventHandler): EventHandler {
    return function errorHandlerMiddleware(
      context: Context,
      serviceInjections: ServiceInjection,
    ): Promise<unknown> {
      return handler(context, serviceInjections)
        .catch((err: unknown) => {
          const error =
            err instanceof Error
              ? err
              : new WeaveError((err as { message?: string })?.message ?? String(err));

          if (runtime.nodeId !== context.nodeId && context.id) {
            runtime.transport?.removePendingRequestsById(context.id);
          }

          Object.defineProperty(error, "context", {
            value: context,
            writable: true,
            enumerable: false,
          });

          runtime.log.debug(`The event "${context.eventName}" was rejected`, {
            requestId: context.requestId,
            error,
          });
          return runtime.handleError(error);
        })
        .catch((err: unknown) => {
          // we just log the error because we don't want to crash the event loop
          runtime.log.error(err as Error);
        });
    };
  };

  return {
    localAction: wrapErrorHandlerMiddleware,
    remoteAction: wrapErrorHandlerMiddleware,
    localEvent: wrapEventErrorHandlerMiddleware,
  };
};
