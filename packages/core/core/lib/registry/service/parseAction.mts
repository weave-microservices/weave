import { isFunction, clone, isObject, promisify } from "@weave-js/utils";
import { WeaveError } from "../../errors.mts";
import { wrapHandler } from "../../utils/wrap-handler.mts";
import type { Runtime, Service, ServiceActionSchema } from "../../../types/index.js";

export const parseAction = (
  runtime: Runtime,
  service: Service,
  actionDefinition: ServiceActionSchema,
  name: string,
) => {
  let action = actionDefinition;

  // if the handler is a method (short form), we wrap the method in our handler object.
  if (isFunction(actionDefinition)) {
    action = wrapHandler(actionDefinition);
  } else if (isObject(actionDefinition)) {
    action = clone(actionDefinition);
  } else {
    runtime.handleError(
      new WeaveError(`Invalid action definition in "${name}" on service "${service.name}".`),
    );
  }

  const handler = action.handler;

  // Action handler has to be a function
  if (!isFunction(handler)) {
    runtime.handleError(
      new WeaveError(`Missing action handler in "${name}" on service "${service.name}".`),
    );
  }

  action.name = service.name + "." + (action.name || name);
  action.shortName = name;

  // if this is a versioned service. The action name is prefixed with the version number.
  if (service.version) {
    action.name = `v${service.version}.${action.name}`;
  }

  action.service = service;
  action.version = service.version;
  action.handler = promisify(handler.bind(service));

  // Create and cache a logger for this action
  action.log = runtime.createLogger("ACTION", {
    svc: service.name,
    action: action.name,
  });

  return action;
};
