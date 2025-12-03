
import { defaultsDeep } from '@weave-js/utils';
import { createLogger as createDefaultLogger } from '../logger/index.mts';
import type { Runtime } from '../../types/index.js';

const DEFAULT_LOGGER_NAME = "WEAVE";

export const initLogger = (runtime: Runtime) => {
  /**
   * Factory function to create module-specific loggers
   * @param {string} moduleName - Name of the module requesting a logger
   * @param {object} [additional={}] - Additional metadata to include in log entries
   * @returns {import("../../types").Logger} Configured logger instance
   */
  const loggerFactory = (moduleName: string, additional = {}) => {
    const bindings = {
      nodeId: runtime.options.nodeId,
      moduleName,
      ...additional
    };

    if (typeof runtime.options.logger === 'function') {
      return runtime.options.logger(bindings, runtime.options.logger);
    }

    const loggerOptions = defaultsDeep({
      base: {
        ...bindings
      }
    }, runtime.options.logger);

    return createDefaultLogger(loggerOptions);
  };


  const createLogger = (moduleName: string, service?: object) => loggerFactory(moduleName, service);

  /**
   * Main runtime logger instance
   * @type {import("../../types").Logger}
   */
  const log = createLogger(DEFAULT_LOGGER_NAME);

  Object.assign(runtime, {
    createLogger,
    log
  });
};
