/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */
import { Constants } from "../../metrics/index.mts";
import * as Errors from "../../errors.mts";
import type {
  ActionHandler,
  Context,
  Middleware,
  Runtime,
  ServiceInjection,
  ParsedAction,
} from "../../../types/index.js";
import type { BulkheadQueueItem } from "./types.js";

export default (runtime: Runtime): Middleware => {
  return {
    created(): void {
      if (runtime.options.metrics?.enabled && runtime.metrics) {
        // todo: add bulkhead metrics
        runtime.metrics.register({
          type: "gauge",
          name: Constants.BULKHEAD_REQUESTS_IN_FLIGHT,
          description: "Number of in flight requests.",
        });
      }
    },
    localAction(handler: ActionHandler, action: ParsedAction): ActionHandler {
      const bulkheadOptions = runtime.options.bulkhead;

      if (bulkheadOptions?.enabled) {
        const concurrentCalls = bulkheadOptions.concurrentCalls ?? 0;
        const maxQueueSize = bulkheadOptions.maxQueueSize ?? 0;
        const queue: BulkheadQueueItem[] = [];
        let currentlyInFlight = 0;

        const callNext = (): void => {
          if (queue.length === 0) return;
          if (currentlyInFlight >= concurrentCalls) return;

          const item = queue.shift();
          if (!item) return;

          currentlyInFlight++;
          handler(item.context, item.serviceInjections)
            .then((result: unknown) => {
              currentlyInFlight--;
              item.resolve(result);
              callNext();
            })
            .catch((error: unknown) => {
              currentlyInFlight--;
              callNext();
              return item.reject(error);
            });
        };

        return function bulkheadMiddleware(
          context: Context,
          serviceInjections: ServiceInjection,
        ): Promise<unknown> {
          // Execute action immediately
          if (currentlyInFlight < concurrentCalls) {
            currentlyInFlight++;
            return handler(context, serviceInjections)
              .then((result: unknown) => {
                currentlyInFlight--;
                callNext();
                return result;
              })
              .catch((error: unknown) => {
                currentlyInFlight--;
                callNext();
                return Promise.reject(error);
              });
          }

          // Reject the action if the max queue size is reached.
          if (maxQueueSize > 0 && maxQueueSize < queue.length) {
            return Promise.reject(
              new Errors.WeaveQueueSizeExceededError({
                action: action.name,
                limit: maxQueueSize,
                size: queue.length,
              }),
            );
          }

          // Queue the request
          return new Promise((resolve, reject) =>
            queue.push({ resolve, reject, context, serviceInjections }),
          );
        };
      }
      return handler;
    },
  };
};
