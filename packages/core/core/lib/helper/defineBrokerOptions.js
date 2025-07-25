/** @import { BrokerOptions } from '@weave-js/core' */

/**
 * Helper function to define broker options with proper TypeScript inference
 *
 * This is a type helper that provides compile-time type checking and IntelliSense
 * for broker configuration. It performs no runtime processing - just returns the
 * options as-is while providing type safety and configuration validation.
 *
 * @param {BrokerOptions} options - Complete broker configuration options
 * @returns {BrokerOptions} Same broker options with preserved types
 * @example
 * const brokerConfig = defineBrokerOptions({
 *   nodeId: 'my-node',
 *   logger: {
 *     level: 'info',
 *     format: 'human'
 *   },
 *   transport: {
 *     adapter: 'TCP',
 *     options: {
 *       port: 3000
 *     }
 *   },
 *   cache: {
 *     adapter: 'Memory'
 *   }
 * });
*/
module.exports = function (options) {
  return options;
};
