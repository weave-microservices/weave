/**
 * @typedef {import('./types.js').BrokerOptions} BrokerOptions
 * @typedef {import('./types.js').Runtime} Runtime
 * @typedef {import('./types.js').Broker} Broker
*/

const { defaultsDeep } = require('@weave-js/utils');
const { Runtime } = require('./buildRuntime');
const { createBrokerInstance } = require('./broker');

export * as options from './broker/defaultOptions';

/**
 * Build runtime object
 * @param {BrokerOptions} options Broker options
 * @return {Broker} Broker instance
*/
exports.createBroker = (options) => {
  const defaultOptions = getDefaultOptions();

  options = defaultsDeep(options, defaultOptions);

  const runtime = new Runtime(options);

  return createBrokerInstance(runtime);
};

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
