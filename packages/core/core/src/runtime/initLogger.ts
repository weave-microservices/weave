import { Runtime } from "./Runtime";

const { defaultsDeep } = require('@weave-js/utils');
const { createLogger: createDefaultLogger } = require('../logger/index');

/**
 * Init logger
 * @param {Runtime} runtime - Runtime reference
 * @returns {void}
 */
exports.initLogger = (runtime: Runtime) => {
  const loggerFactory = (runtime: Runtime, moduleName: string, additional = {}) => {
    const bindings = {
      nodeId: runtime.options.nodeId,
      moduleName,
      ...additional
    };

    // custom logger generator function.
    if (typeof runtime.options.logger === 'function') {
      return runtime.options.logger(bindings, runtime.options.logger.level);
    }

    // merge log options
    const loggerOptions = defaultsDeep({
      base: {
        ...bindings
      }
    }, runtime.options.logger);

    return createDefaultLogger(loggerOptions);
  };

  const createLogger = (moduleName, service) => loggerFactory(runtime, moduleName, service);

  // create weave default logger
  const log = createLogger('WEAVE');

  Object.assign(runtime, {
    createLogger,
    log
  });
};
