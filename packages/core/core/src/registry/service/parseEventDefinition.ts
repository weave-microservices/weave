import { Runtime } from "../../runtime/Runtime";
import { Service } from "../../service/Service";

const { isFunction, clone, wrapHandler, isObject, promisify } = require('@weave-js/utils');
const { WeaveError } = require('../../errors');

const parseEventDefinition = function (runtime: Runtime, service: Service, eventDefinition, name: string) {
  let event;

  // if the handler is a method (short form), we wrap the method in our handler object.
  if (isFunction(eventDefinition)) {
    event = wrapHandler(eventDefinition);
  } else if (isObject(eventDefinition)) {
    event = clone(eventDefinition);
  } else {
    runtime.handleError(new WeaveError(`Invalid event definition "${name}" on service "${service.name}".`));
  }

  // Event handler has to be a function
  if (!isFunction(event.handler) && !Array.isArray(event.handler)) {
    runtime.handleError(new WeaveError(`Missing event handler for "${name}" on service "${service.name}".`));
  }

  event.service = service;

  let handler;
  if (isFunction(event.handler)) {
    handler = promisify(event.handler.bind(service));
  } else if (Array.isArray(event.handler)) {
    handler = event.handler.map(h => {
      return promisify(h.bind(service));
    });
  }

  if (!event.name) {
    event.name = name;
  }

  if (isFunction(handler)) {
    event.handler = (context) => handler(context);
  } else if (Array.isArray(handler)) {
    event.handler = (context) => Promise.all(handler.map(h => h(context)));
  }

  event.service = service;

  return event;
};

export { parseEventDefinition };