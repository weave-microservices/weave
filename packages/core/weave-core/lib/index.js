/**
 * @typedef {import('../types.js').BrokerOptions} BrokerOptions
 * @typedef {import('../types.js').Broker} Broker
*/

// Broker
exports.createBroker = require('./broker/broker')
exports.defaultOptions = require('./broker/default-options')

/**
 * @deprecated Weave factory method is deprecated since version 0.9.0.
 * @param {BrokerOptions} options Broker options.
 * @returns {Broker} Broker instance.
*/
exports.Weave = (options) => {
  return this.createBroker(options)
}

// Errors

exports.Errors = require('./errors')

// Transport
exports.TransportAdapters = require('./transport/adapters')
exports.Constants = require('./constants')
exports.Cache = require('./cache')
exports.BaseTracingCollector = require('./tracing/collectors/base')
exports.TracingAdapters = require('./tracing/collectors')

// Helper
exports.defineBrokerOptions = require('./helper/define-broker-options')
exports.defineService = require('./helper/define-service')
