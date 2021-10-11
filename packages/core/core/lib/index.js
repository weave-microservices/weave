/**
 * @typedef {import('./types.js').BrokerOptions} BrokerOptions
 * @typedef {import('./types.js').Runtime} Runtime
 * @typedef {import('./types.js').Broker} Broker
*/

const { getDefaultOptions } = require('./broker/default-options')
const { defaultsDeep } = require('@weave-js/utils')
const { buildRuntime } = require('./build-runtime')
const { createBrokerInstance } = require('./broker')

/**
 * @type {BrokerOptions} options Broker options
*/
exports.defaultOptions = require('./broker/default-options')

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
  const runtime = buildRuntime(options)

  // Create broker instance
  return createBrokerInstance(runtime)
}

// eslint-disable-next-line valid-jsdoc
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
exports.createBaseTracingCollector = require('./tracing/collectors/base')
exports.TracingAdapters = require('./tracing/collectors')

// Helper
exports.defineBrokerOptions = require('./helper/define-broker-options')
exports.defineService = require('./helper/define-service')
exports.defineAction = require('./helper/define-action')
