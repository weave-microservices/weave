const { getDefaultOptions } = require('./broker/defaultOptions');
const { defaultsDeep } = require('@weave-js/utils');
const { initRuntime } = require('./buildRuntime');
const { createBrokerInstance } = require('./broker');

/**
 * Default broker configuration options
 * @type {import('../types').BrokerOptions}
 */
exports.defaultOptions = getDefaultOptions();

/**
 * Creates a new Weave broker instance with the provided configuration
 * @param {import('../types').BrokerOptions} [options] - Broker configuration options
 * @returns {import('../types').Broker} A new Broker instance
 * @example
 * const { createBroker } = require('@weave-js/core');
 *
 * const broker = createBroker({
 *   nodeId: 'my-service',
 *   logger: { level: 'info' },
 *   transport: { adapter: 'TCP' }
 * });
 *
 * broker.start();
 */
exports.createBroker = (options) => {
  const defaultOptions = getDefaultOptions();

  options = defaultsDeep(options, defaultOptions);

  const runtime = initRuntime(options);
  const broker = createBrokerInstance(runtime);

  // Establish circular reference for graceful shutdown in fatal errors
  runtime.broker = broker;

  return broker;
};

/**
 * @deprecated since version 0.9.0 - Use createBroker instead
 * @param {import('../types').BrokerOptions} [options] - Broker configuration options
 * @returns {import('../types').Broker} A new Broker instance
 */
exports.Weave = exports.createBroker;

/**
 * Weave error classes and utilities
 * @namespace
 */
exports.Errors = require('./errors');

/**
 * Weave constants and internal identifiers
 * @namespace
 */
exports.Constants = require('./constants');

/**
 * Cache adapter implementations
 * @namespace
 */
exports.Cache = require('./cache/adapters');

/**
 * @deprecated since version 0.10.0 - Use TracingAdapters instead
 */
exports.createBaseTracingCollector = require('./tracing/collectors/base').createBaseTracingCollector;

/**
 * Transport adapter implementations
 * @namespace
 */
exports.TransportAdapters = require('./transport/adapters');

/**
 * Tracing collector implementations
 * @namespace
 */
exports.TracingAdapters = require('./tracing/collectors');

/**
 * Cache adapter implementations (alias for Cache)
 * @namespace
 */
exports.CacheAdapters = require('./cache/adapters');

/**
 * Helper function for type-safe broker option definitions
 * @function
 */
exports.defineBrokerOptions = require('./helper/defineBrokerOptions');

/**
 * Helper function for type-safe service definitions
 * @function
 */
exports.defineService = require('./helper/defineService');

/**
 * Helper function for type-safe action definitions
 * @function
 */
exports.defineAction = require('./helper/defineAction');
