/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2026 Fachwerk
 */

import { buildActionTags, buildEventTags, addResponseTags } from "./tags.mts";
import type {
  ActionHandler,
  ActionTracingOptions,
  Context,
  EventHandler,
  EventTracingOptions,
  Middleware,
  Runtime,
  ServiceInjection,
  ParsedAction,
  ParsedEvent,
} from "../../../types/index.js";

function normalizeActionTracingOptions(
  tracing: boolean | ActionTracingOptions | undefined,
): ActionTracingOptions {
  if (typeof tracing === "object" && tracing !== null) {
    return tracing;
  }
  return {};
}

function normalizeEventTracingOptions(
  tracing: boolean | EventTracingOptions | undefined,
): EventTracingOptions {
  if (typeof tracing === "object" && tracing !== null) {
    return tracing;
  }
  return {};
}

function getSpanName(context: Context, actionTracingOptions: ActionTracingOptions): string {
  let spanName = `action "${context.action?.name}"`;

  try {
    if (actionTracingOptions.spanName) {
      switch (typeof actionTracingOptions.spanName) {
        case "string":
          spanName = actionTracingOptions.spanName;
          break;
        case "function":
          spanName = actionTracingOptions.spanName.call(context.service, context);
          break;
      }
    }
  } catch (error) {
    context.service?.log.warn(
      {
        requestId: context.requestId,
        spanId: context.span?.id,
      },
      `Error while getting span name: ${(error as Error).message}`,
    );
  }

  return spanName;
}

const wrapTracingLocalActionMiddleware = function (
  this: Runtime,
  handler: ActionHandler,
  action: ParsedAction,
): ActionHandler {
  const globalTracingOptions = this.options.tracing || {};
  const actionTracingOptions = normalizeActionTracingOptions(action.tracing);

  if (globalTracingOptions.enabled) {
    return function tracingLocalMiddleware(context: Context, serviceInjections: ServiceInjection) {
      const tags = buildActionTags(context, globalTracingOptions, actionTracingOptions);

      const spanName = getSpanName(context, actionTracingOptions);

      const span = context.startSpan(spanName, {
        id: context.id,
        traceId: context.requestId,
        parentId: context.parentId,
        type: "action",
        service: context.service,
        tags,
        sampled: context.tracing,
      });

      context.tracing = span.sampled;

      return handler(context, serviceInjections)
        .then((result) => {
          const tags = {
            isCachedResult: context.isCachedResult,
          };

          addResponseTags(
            context,
            tags,
            result,
            globalTracingOptions.actions,
            actionTracingOptions,
          );

          span.addTags(tags);
          context.finishSpan(span);
          return result;
        })
        .catch((error) => {
          span.setError(error);
          context.finishSpan(span);
          return Promise.reject(error);
        });
    };
  }
  return handler;
};

const wrapTracingLocalEventMiddleware = function (
  this: Runtime,
  handler: EventHandler,
  event: ParsedEvent,
): EventHandler {
  const service = event.service;
  const tracingOptions = this.options.tracing || {};
  const eventTracingOptions = normalizeEventTracingOptions(event.tracing);

  if (tracingOptions.enabled) {
    return function tracingLocalEventMiddleware(
      context: Context,
      serviceInjections: ServiceInjection,
    ): Promise<any> {
      const tags = buildEventTags(context, tracingOptions, eventTracingOptions);

      const span = context.startSpan(`event "${context.eventName}"`, {
        id: context.id,
        traceId: context.requestId,
        parentId: context.parentId,
        type: "event",
        service,
        tags,
        sampled: context.tracing,
      });

      context.tracing = span.sampled;

      return handler(context, serviceInjections)
        .then((result) => {
          context.finishSpan(span);
          return result;
        })
        .catch((error) => {
          span.setError(error);
          context.finishSpan(span);
          return Promise.reject(error);
        });
    };
  }
  return handler;
};

export default (): Middleware => {
  return {
    localAction: wrapTracingLocalActionMiddleware,
    localEvent: wrapTracingLocalEventMiddleware,
  };
};
