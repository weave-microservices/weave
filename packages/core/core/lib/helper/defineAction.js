/**
 * @import { ServiceActionSchema,TypeMap } from '@weave-js/core'
*/

/**
 * Helper function to define a service action with proper TypeScript inference
 *
 * This is a type helper that provides compile-time type checking and IntelliSense
 * for action definitions. It performs no runtime processing - just returns the
 * action definition as-is while providing type safety.
 *
 * @template {{ [key: string]: { type: keyof TypeMap } } } TParamsSchema
 * @param {ServiceActionSchema<TParamsSchema>} actionDefinition - Action schema with typed parameters
 * @returns {ServiceActionSchema<TParamsSchema>} - Same action schema with preserved types
 * @example
 * const myAction = defineAction({
 *   params: {
 *     name: { type: 'string', required: true },
 *     age: { type: 'number', min: 0 }
 *   },
 *   handler: (ctx) => {
 *     // ctx.params is properly typed as { name: string, age?: number }
 *     return `Hello ${ctx.params.name}`;
 *   }
 * });
*/
module.exports = function defineAction (actionDefinition) {
  return actionDefinition;
};
