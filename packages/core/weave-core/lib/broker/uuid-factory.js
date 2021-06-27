/**
 * @typedef {import('../types.js').Runtime} Runtime
*/

const { isFunction, uuid } = require('@weave-js/utils')

/**
 * Init uuid Generator and attach it to our runtime object.
 * @param {Runtime} runtime Runtime object.
 * @returns {void}
*/
exports.generateUUID = (runtime) => {
  if (runtime.options.uuidFactory && isFunction(runtime.options.uuidFactory)) {
    return runtime.options.uuidFactory(runtime)
  }
  return uuid()
}
