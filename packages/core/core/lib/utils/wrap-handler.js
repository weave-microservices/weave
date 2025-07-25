const { isFunction } = require('@weave-js/utils/lib/is-function');

/**
 * Wrap a function or handler object into a standardized handler format
 *
 * Normalizes action and event handlers to ensure consistent structure.
 * Functions are wrapped into objects with a 'handler' property, while
 * existing handler objects are passed through unchanged.
 *
 * This allows handlers to be defined as either simple functions or
 * objects with additional properties (middleware, validation, etc).
 *
 * @param {Function | import('@weave-js/utils').Handler} action Action function or handler object
 * @returns {import('@weave-js/utils').Handler} Normalized handler object with 'handler' property
 * @example
 * // Function input
 * wrapHandler((ctx) => { ... }) // Returns: { handler: (ctx) => { ... } }
 *
 * // Object input
 * wrapHandler({ handler: (ctx) => { ... }, cache: true }) // Returns: { handler: (ctx) => { ... }, cache: true }
 */
exports.wrapHandler = (action) => isFunction(action) ? { handler: action } : action;
