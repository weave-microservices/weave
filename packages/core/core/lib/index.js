/**
 * @typedef {import('./types.js').BrokerOptions} BrokerOptions
 * @typedef {import('./types.js').Runtime} Runtime
 * @typedef {import('./types.js').Broker} Broker
*/

const { getDefaultOptions } = require('./broker/defaultOptions');
const { defaultsDeep } = require('@weave-js/utils');
const { initRuntime } = require('./buildRuntime');
const { createBrokerInstance } = require('./broker');

/**
 * @type {BrokerOptions} options Broker options
*/
exports.defaultOptions = getDefaultOptions();

/**
 * Build runtime object
 * @param {BrokerOptions} options Broker options
 * @return {Broker} Broker instance
*/
exports.createBroker = (options) => {
  const defaultOptions = getDefaultOptions();

  options = defaultsDeep(options, defaultOptions);

  const runtime = initRuntime(options);

  return createBrokerInstance(runtime);
};

/**
 * @deprecated since version 0.9.0
 * @param {import('./types.js').BrokerOptions} options Broker options.
 * @returns {import('./types.js').Broker} Broker instance
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
