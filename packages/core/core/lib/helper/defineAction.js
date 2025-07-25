/**
 * @import { ServiceActionSchema,TypeMap } from '@weave-js/core'
*/

/**
 * @template {{ [key: string]: { type: keyof TypeMap } } } TParamsSchema
 * @param {ServiceActionSchema<TParamsSchema>} actionDefinition - Action schema
 * @returns {ServiceActionSchema<TParamsSchema>} - Action schema
*/
module.exports = function defineAction (actionDefinition) {
  return actionDefinition;
};
