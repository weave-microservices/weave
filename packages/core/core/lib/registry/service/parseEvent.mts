import { isFunction, clone, isObject, promisify } from "@weave-js/utils";
import { wrapHandler } from "../../utils/wrap-handler.mts";
import { WeaveError } from "../../errors.mts";
import type { Context, ParsedEvent, Runtime, Service, ServiceEventSchema, ServiceInjection } from "../../../types/index.js";

export const parseEvent = (
  runtime: Runtime,
  service: Service,
  eventDefinition: ServiceEventSchema,
  name: string,
): ParsedEvent => {
  let event: any;

  // if the handler is a method (short form), we wrap the method in our handler object.
  if (isFunction(eventDefinition)) {
    event = wrapHandler(eventDefinition);
  } else if (isObject(eventDefinition)) {
    event = clone(eventDefinition);
  } else {
    runtime.handleError(
      new WeaveError(`Invalid event definition "${name}" on service "${service.name}".`),
    );
  }

  // Event handler has to be a function
  if (!isFunction(event.handler) && !Array.isArray(event.handler)) {
    runtime.handleError(
      new WeaveError(`Missing event handler for "${name}" on service "${service.name}".`),
    );
  }

  event.service = service;

  let handler: ((...args: unknown[]) => Promise<unknown>) | ((...args: unknown[]) => Promise<unknown>)[] | undefined;
  if (isFunction(event.handler)) {
    handler = promisify(event.handler.bind(service));
  } else if (Array.isArray(event.handler)) {
    handler = event.handler.map((h: (...args: unknown[]) => unknown) => {
      return promisify(h.bind(service));
    });
  }

  if (!event.name) {
    event.name = name;
  }

  if (isFunction(handler)) {
    event.handler = (context: Context, injection?: ServiceInjection) => handler(context, injection);
  } else if (Array.isArray(handler)) {
    event.handler = (context: Context, injection?: ServiceInjection) => Promise.all(handler.map((h) => h(context, injection)));
  }

  event.service = service;

  // Create and cache a logger for this event
  event.log = runtime.createLogger("EVENT", {
    svc: service.name,
    event: event.name,
  });

  return event;
};
