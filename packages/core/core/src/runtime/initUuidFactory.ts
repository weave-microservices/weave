/**
 * @typedef {import('../types.js').Runtime} Runtime
*/

import { Runtime } from "./Runtime";

const { isFunction, uuid } = require('@weave-js/utils');

exports.initUUIDFactory = (runtime: Runtime): void => {
  const { options } = runtime;

  runtime.generateUUID = (options.uuidFactory && isFunction(options.uuidFactory)) ? () => options.uuidFactory(runtime) : uuid;
};
