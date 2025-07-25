
const { defaultsDeep } = require('@weave-js/utils');
const { createLogger: createDefaultLogger } = require('../logger/index');

/**
 * Initializes the logging subsystem for the runtime
 *
 * Creates a logger factory that can generate module-specific loggers with consistent formatting
 * and configuration. Supports both custom logger functions and built-in logger with configurable
 * levels, formatting, and output destinations.
 *
 * @param {import("../../types").Runtime} runtime - Runtime instance to initialize logger for
 * @returns {void}
 * @example
 * initLogger(runtime);
 * const moduleLogger = runtime.createLogger('SERVICE-MANAGER');
 * moduleLogger.info('Service initialized');
 */
exports.initLogger = (runtime) => {
  /**
   * Factory function to create module-specific loggers
   * @param {string} moduleName - Name of the module requesting a logger
   * @param {object} [additional={}] - Additional metadata to include in log entries
   * @returns {import("../../types").Logger} Configured logger instance
   */
  const loggerFactory = (moduleName, additional = {}) => {
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

  /**
   * Public API for creating loggers
   * @param {string} moduleName - Name of the module requesting a logger
   * @param {object} [service] - Service context for additional metadata
   * @returns {import("../../types").Logger} Configured logger instance
   */
  const createLogger = (moduleName, service) => loggerFactory(moduleName, service);

  /**
   * Main runtime logger instance
   * @type {import("../../types").Logger}
   */
  const log = createLogger('WEAVE');

  Object.assign(runtime, {
    createLogger,
    log
  });
};
