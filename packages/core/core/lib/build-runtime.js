/**
 * @typedef {import('./types.js').BrokerOptions} BrokerOptions
 * @typedef {import('./types.js').Runtime} Runtime
 * @typedef {import('./types.js').Broker} Broker
*/

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
const { version } = require('../package.json')
const { errorHandler, fatalErrorHandler } = require('./error-handler')
const { uuid } = require('@weave-js/utils')
const EventEmitter = require('eventemitter2')

/**
 * Build runtime object
 * @param {BrokerOptions} options Broker options
 * @return {Runtime} Runtime
*/
exports.initRuntime = (options) => {
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
