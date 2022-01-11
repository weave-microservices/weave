/**
 * @typedef {import('./types.js').BrokerOptions} BrokerOptions
 * @typedef {import('./types.js').Runtime} Runtime
 * @typedef {import('./types.js').Broker} Broker
*/

const { getDefaultOptions } = require('./broker/defaultOptions')
const { defaultsDeep } = require('@weave-js/utils')
const { initRuntime } = require('./buildRuntime')
const { createBrokerInstance } = require('./broker')

/**
 * @type {BrokerOptions} options Broker options
*/
exports.defaultOptions = getDefaultOptions()

/**
 * Build runtime object
 * @param {BrokerOptions} options Broker options
 * @return {Broker} Broker instance
*/
exports.createBroker = (options) => {
  // get default options
  const defaultOptions = getDefaultOptions()

  // merge options with default options
  options = defaultsDeep(options, defaultOptions)

  // Init runtime
  const runtime = initRuntime(options)

  // Create broker instance
  return createBrokerInstance(runtime)
}

/**
 * @deprecated since version 0.9.0
 * @param {import('./types.js').BrokerOptions} options Broker options.
 * @returns {import('./types.js').Broker} Broker instance
*/
exports.Weave = exports.createBroker

// Errors
exports.Errors = require('./errors')

exports.Constants = require('./constants')

// Transport
exports.TransportAdapters = require('./transport/adapters')

// Caching
exports.Cache = require('./cache')

/**
 * @deprecated since version 0.10.0
*/
exports.createBaseTracingCollector = require('./tracing/collectors/base').createBaseTracingCollector
exports.TracingAdapters = require('./tracing/collectors')

// Helper
exports.defineBrokerOptions = require('./helper/defineBrokerOptions')
exports.defineService = require('./helper/defineService')
exports.defineAction = require('./helper/defineAction')
