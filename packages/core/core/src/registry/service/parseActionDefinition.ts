import { Runtime } from "../../runtime/Runtime";
import { Action } from "../../service/Action";
import { ActionHandler } from "../../service/ActionHandler";
import { ActionSchema } from "../../service/ActionSchema";
import { Service } from "../../service/Service";

const { isFunction, clone, wrapHandler, isObject, promisify } = require('@weave-js/utils');
const { WeaveError } = require('../../errors');

const parseActionDefinition = (runtime: Runtime, service: Service, actionDefinition: ActionHandler | ActionSchema, name: string): Action => {
  let action: Partial<Action> = {};
  
  // if the handler is a method (short form), we wrap the method in our handler object.
  if (isFunction(actionDefinition)) {
    action = wrapHandler(actionDefinition);
  } else if (isObject(actionDefinition)) {
    action = clone(actionDefinition);
  } else {
    runtime.handleError(new WeaveError(`Invalid action definition in "${name}" on service "${service.name}".`));
  }

  const handler = action.handler!;

  // Action handler has to be a function
  if (!isFunction(handler)) {
    runtime.handleError(new WeaveError(`Missing action handler in "${name}" on service "${service.name}".`));
  }

  action.shortName = name;
  
  // if this is a versioned service. The action name is prefixed with the version number.
  if (service.version) {
    action.name = `v${service.version}.${action.name}`;
  } else {
    action.name = service.name + '.' + (action.name || name);
  }

  action.service = service;
  
  if (service.version) {
    action.version = service.version;
  }
  
  action.handler = promisify(handler.bind(service));

  return action as Action;
};

export { parseActionDefinition }