const { isFunction } = require('@weave-js/utils/lib/is-function');

/**
 *
 * @param {() => {} | import('@weave-js/utils').Handler} action
 * @returns {import('@weave-js/utils').Handler}
 */
exports.wrapHandler = (action) => isFunction(action) ? { handler: action } : action;
