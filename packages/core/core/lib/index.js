const { getDefaultOptions } = require('./broker/defaultOptions');
const { defaultsDeep } = require('@weave-js/utils');
const { initRuntime } = require('./buildRuntime');
const { createBrokerInstance } = require('./broker');

/**
 * @type {import('../types').Weave.BrokerOptions} options Broker options
*/
exports.defaultOptions = getDefaultOptions();

/**
 * Build runtime object
 * @param {import('../types').Weave.BrokerOptions} options Broker options
 * @return {import('../types').Weave.Broker} Broker instance
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
 * @deprecated since version 0.9.0
 * @param {import('../types').Weave.BrokerOptions} options Broker options.
 * @returns {import('../types').Weave.Broker} Broker instance
*/
exports.Weave = exports.createBroker;

exports.Errors = require('./errors');

exports.Constants = require('./constants');

exports.Cache = require('./cache/adapters');

/**
 * @deprecated since version 0.10.0
*/
exports.createBaseTracingCollector = require('./tracing/collectors/base').createBaseTracingCollector;
exports.TransportAdapters = require('./transport/adapters');
exports.TracingAdapters = require('./tracing/collectors');
exports.CacheAdapters = require('./cache/adapters');

exports.defineBrokerOptions = require('./helper/defineBrokerOptions');
exports.defineService = require('./helper/defineService');
exports.defineAction = require('./helper/defineAction');
