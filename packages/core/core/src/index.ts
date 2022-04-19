/**
 * @typedef {import('./types.js').BrokerOptions} BrokerOptions
 * @typedef {import('./types.js').Runtime} Runtime
 * @typedef {import('./types.js').Broker} Broker
*/

import { Broker } from "./broker/Broker";
import { BrokerConfiguration } from "./broker/Options";

const { getDefaultOptions } = require('./broker/defaultOptions');
const { defaultsDeep } = require('@weave-js/utils');
const { initRuntime } = require('./buildRuntime');

exports.defaultOptions = getDefaultOptions();

/**
 * Build runtime object
 * @param {BrokerOptions} options Broker options
 * @return {Broker} Broker instance
*/
export function createBroker (options: BrokerConfiguration): Broker {
  // get default options
  const defaultOptions = getDefaultOptions();

  // merge options with default options
  options = defaultsDeep(options, defaultOptions);

  // Init runtime
  const runtime = initRuntime(options);

  // Create broker instance
  return new Broker(runtime);
};

/**
 * @deprecated since version 0.9.0
 * @param {import('./types.js').BrokerOptions} options Broker options.
 * @returns {import('./types.js').Broker} Broker instance
*/
exports.Weave = exports.createBroker;

// Errors
exports.Errors = require('./errors');

exports.Constants = require('./constants');

// Caching
exports.Cache = require('./cache/adapters/index');

/**
 * @deprecated since version 0.10.0
*/
exports.createBaseTracingCollector = require('./tracing/collectors/base').createBaseTracingCollector;
exports.TransportAdapters = require('./transport/adapters/index');
exports.TracingAdapters = require('./tracing/collectors/index');
exports.CacheAdapters = require('./cache/adapters/index');

// Helper
exports.defineBrokerOptions = require('./helper/defineBrokerOptions');
exports.defineService = require('./helper/defineService');
exports.defineAction = require('./helper/defineAction');
