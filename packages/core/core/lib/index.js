/**
 * @typedef {import('./types.js').BrokerOptions} BrokerOptions
 * @typedef {import('./types.js').Runtime} Runtime
 * @typedef {import('./types.js').Broker} Broker
*/

const EventEmitter = require('eventemitter2')
const { getDefaultOptions } = require('./broker/default-options')
const { defaultsDeep, uuid, isFunction } = require('@weave-js/utils')
const { initLogger } = require('./runtime/init-logger')
const { initMiddlewareHandler } = require('./runtime/init-middleware-manager')
const { initRegistry } = require('./runtime/init-registry')
const { initContextFactory } = require('./runtime/init-context-factory')
const { initEventbus } = require('./runtime/init-eventbus')
const { initValidator } = require('./runtime/init-validator')
const { initTransport } = require('./runtime/init-transport')
const { initCache } = require('./runtime/init-cache')
const { initActionInvoker } = require('./runtime/init-action-invoker')
const { initServiceManager } = require('./runtime/init-service-manager')
const { initMetrics } = require('./runtime/init-metrics')
const { initTracer } = require('./runtime/init-tracing')
const { initUUIDFactory } = require('./runtime/init-uuid-factory')
const { createBrokerInstance } = require('./broker')
const { version } = require('../package.json')

exports.defaultOptions = require('./broker/default-options')

const errorHandler = ({ options }, error) => {
  if (options.errorHandler) {
    return options.errorHandler.call(null, error)
  }
  throw error
}

const fatalErrorHandler = (runtime, message, error, killProcess = true) => {
  const { options, log } = runtime
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
      instanceId: uuid(),
      isStarted: false
    },
    handleError: (error) => errorHandler(runtime, error),
    fatalError: (message, error, killProcess) => fatalErrorHandler(runtime, message, error, killProcess)
  }

  // Init modules
  initLogger(runtime)
  initUUIDFactory(runtime)
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
