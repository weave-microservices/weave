
/* istanbul ignore next */

/**
 * @import * as Weave from '@weave-js/core'
 */

/**
 * Helper function to define a service schema with proper TypeScript inference
 *
 * This is a type helper that provides compile-time type checking and IntelliSense
 * for service definitions. It performs no runtime processing - just returns the
 * service schema as-is while providing type safety and better developer experience.
 *
 * @param {Weave.ServiceSchema} serviceSchema - Complete service schema definition
 * @returns {Weave.ServiceSchema} Same service schema with preserved types
 * @example
 * const userService = defineService({
 *   name: 'users',
 *   actions: {
 *     create: {
 *       params: {
 *         name: { type: 'string', required: true },
 *         email: { type: 'email', required: true }
 *       },
 *       handler: (ctx) => {
 *         // ctx.params is properly typed
 *         return this.createUser(ctx.params.name, ctx.params.email);
 *       }
 *     }
 *   },
 *   methods: {
 *     createUser: (name, email) => ({ id: 1, name, email })
 *   }
 * });
*/
module.exports = function (serviceSchema) {
  return serviceSchema;
};
