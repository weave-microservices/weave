const { isFunction, clone, isObject, promisify } = require('@weave-js/utils');
const { WeaveError } = require('../../errors');
const { wrapHandler } = require('../../utils/wrap-handler');

/**
 *
 * @param {import('../../../types').Runtime} runtime Runtime
 * @param {import('../../../types').Service} service Service
 * @param {import('../../../types').ServiceActionSchema} actionDefinition Action definition
 * @param {string} name
 * @returns {import('../../../types').ServiceActionDefinition}
 */
module.exports.parseAction = (runtime, service, actionDefinition, name) => {
  let action = actionDefinition;

  // if the handler is a method (short form), we wrap the method in our handler object.
  if (isFunction(actionDefinition)) {
    action = wrapHandler(actionDefinition);
  } else if (isObject(actionDefinition)) {
    action = clone(actionDefinition);
  } else {
    runtime.handleError(new WeaveError(`Invalid action definition in "${name}" on service "${service.name}".`));
  }

  const handler = action.handler;

  // Action handler has to be a function
  if (!isFunction(handler)) {
    runtime.handleError(new WeaveError(`Missing action handler in "${name}" on service "${service.name}".`));
  }

  action.name = service.name + '.' + (action.name || name);
  action.shortName = name;

  // if this is a versioned service. The action name is prefixed with the version number.
  if (service.version) {
    action.name = `v${service.version}.${action.name}`;
  }

  action.service = service;
  action.version = service.version;
  action.handler = promisify(handler.bind(service));

  return action;
};
