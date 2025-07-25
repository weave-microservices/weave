const { isFunction, uuid } = require('@weave-js/utils');

/**
 * Init uuid Generator and attach it to our runtime object.
 * @param {import('../../types').Runtime} runtime Runtime object.
 * @returns {void}
*/
exports.initUUIDFactory = (runtime) => {
  const { options } = runtime;

  runtime.generateUUID = (options.uuidFactory && isFunction(options.uuidFactory)) ? () => options.uuidFactory(runtime) : uuid;
};
