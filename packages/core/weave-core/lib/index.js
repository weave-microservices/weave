/**
 * @typedef {import('./types.js').BrokerOptions} BrokerOptions
 * @typedef {import('./types.js').Runtime} Runtime
 * @typedef {import('./types.js').Broker} Broker
*/

const EventEmitter = require('eventemitter2')
const { getDefaultOptions } = require('./broker/default-options')
const { defaultsDeep } = require('@weave-js/utils')
const { initLogger } = require('./logger/init-logger')
const { initMiddlewareHandler } = require('./broker/init-middleware-manager')
const { initRegistry } = require('./registry')
const { initContextFactory } = require('./broker/init-context-factory')
const { initEventbus } = require('./broker/init-eventbus')
const { initValidator } = require('./broker/validator')
const { initTransport } = require('./transport/init-transport')
const { initCache } = require('./cache/init-cache')
const { initActionInvoker } = require('./broker/init-action-invoker')
const { initServiceManager } = require('./broker/init-service-manager')
const { initMetrics } = require('./metrics/init-metrics')
const { initTracer } = require('./tracing/init-tracing')
const { initHealth } = require('./broker/init-health')
const { createBrokerInstance } = require('./broker')
const { version } = require('../package.json')

exports.defaultOptions = require('./broker/default-options')

const errorHandler = ({ options }, error) => {
  if (options.errorHandler) {
    return options.errorHandler.call(null, error)
  }
  throw error
}

const fatalErrorHandler = ({ options, log }, message, error, killProcess = true) => {
  if (options.logger.enabled) {
    log.fatal(error, message)
  } else {
    console.error(message, error)
  }

  if (killProcess) {
    process.exit(1)
  }
}

/**
 * Build runtime object
 * @param {BrokerOptions} options Broker options
 * @return {Runtime} Runtime
 */
const buildRuntime = (options) => {
  /**
   * Event bus
   * @returns {EventEmitter} Service object.
  */
  const bus = new EventEmitter({
    wildcard: true,
    maxListeners: 1000
  })

  // Create base runtime object
  const runtime = {
    nodeId: options.nodeId,
    version,
    options,
    bus,
    state: {
      isStarted: false
    },
    handleError: (error) => errorHandler(runtime, error),
    fatalError: (message, error, killProcess) => fatalErrorHandler(runtime, message, error, killProcess)
  }

  initLogger(runtime)
  initMiddlewareHandler(runtime)
  initRegistry(runtime)
  initContextFactory(runtime)
  initEventbus(runtime)
  initValidator(runtime)
  initTransport(runtime)
  initCache(runtime)
  initActionInvoker(runtime)
  initServiceManager(runtime)
  initMetrics(runtime)
  initTracer(runtime)
  initHealth(runtime)

  return runtime
}

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

  // const { createBrokerInstance } = initBroker(options)

  const runtime = buildRuntime(options)

  return createBrokerInstance(runtime)
}

// eslint-disable-next-line valid-jsdoc
/**
 * @deprecated since version 0.10.0
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
exports.BaseTracingCollector = require('./tracing/collectors/base')
exports.TracingAdapters = require('./tracing/collectors')

// Helper
exports.defineBrokerOptions = require('./helper/define-broker-options')
exports.defineService = require('./helper/define-service')
exports.defineAction = require('./helper/define-action')
