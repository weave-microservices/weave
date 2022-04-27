/* istanbul ignore next */

import { ActionSchema } from "../service/ActionSchema";

/**
 * Create and register a new service action.
 * @param {ActionSchema} actionDefinition - Schema of the the action
 * @returns {ActionSchema} Action definition
*/
export default function (actionDefinition: ActionSchema): ActionSchema {
  return actionDefinition;
};
