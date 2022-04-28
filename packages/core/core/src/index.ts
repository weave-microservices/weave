import { Broker } from "./broker/Broker";
import { BrokerConfiguration } from "./broker/BrokerConfiguration";

import { getDefaultConfiguration } from './broker/defaultOptions';
import { Runtime } from './runtime/buildRuntime';
const { defaultsDeep } = require('@weave-js/utils');

exports.defaultOptions = exports.defaultConfiguration = getDefaultConfiguration();

export function createBroker (options: BrokerConfiguration): Broker {
  // get default options
  const defaultOptions = getDefaultConfiguration();

  // merge options with default options
  options = defaultsDeep(options, defaultOptions);

  // Init runtime
  const runtime = new Runtime(options);

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
