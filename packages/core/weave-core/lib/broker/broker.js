/**
 * @typedef {import('../types.js').BrokerOptions} BrokerOptions
 * @typedef {import('../types.js').Broker} Broker
 * @typedef {import('../types.js').Transport} Transport
*/

// node packages
const path = require('path')
const fs = require('fs')
const glob = require('glob')
const { isFunction, debounce } = require('@weave-js/utils')
const { createServiceFromSchema } = require('../registry/service')
const Middlewares = require('../middlewares')
const createHealthcheck = require('./health')
const { Tracer } = require('../tracing')
const { MetricsStorage } = require('../metrics')
const { registerMetrics } = require('./broker-metrics')
const { generateUUID } = require('./uuid-factory')
/**
 *  Creates a new Weave instance
 * @param {BrokerOptions} options - Service broker options.
 * @returns {Broker} Broker instance
*/
module.exports = () => (runtime) => {
  const {
    version,
    options,
    bus,
    eventBus,
    middlewareHandler,
    registry,
    contextFactory,
    validator,
    log,
    cache,
    services,
    transport,
    handleError
  } = runtime

  const { nodeId } = options

  // Log Messages
  log.info(`Initializing #weave node version ${version}`)
  log.info(`Node Id: ${options.nodeId}`)

  if (options.namespace) {
    log.info(`Namespace: ${options.namespace}`)
  }

  const health = createHealthcheck()

  const servicesChanged = (isLocalService) => {
    // Send local notification.
    eventBus.broadcastLocal('$services.changed', { isLocalService })

    // If the service is a local service - send current node informations to other nodes
    if (broker.isStarted && isLocalService && transport) {
      transport.sendNodeInfo()
    }
  }

  const registerLocalService = (serviceSpecification, notify = false) => {
    registry.registerLocalService(serviceSpecification)
    servicesChanged(notify)
  }

  const serviceWatcher = function (service, onServiceChanged) {
    if (service.filename && onServiceChanged) {
      const debouncedOnServiceChange = debounce(onServiceChanged, 500)

      const watcher = fs.watch(service.filename, (eventType, filename) => {
        log.info(`The Service ${service.name} has been changed. (${eventType}, ${filename}) `)
        watcher.close()
        debouncedOnServiceChange(this, service)
      })
    }
  }

  const destroyService = (service) => Promise.resolve()
    .then(() => service.stop())
    .then(() => log.info(`Service "${service.name}" was stopped.`))
    .then(() => {
      registry.deregisterService(service.name, service.version)
      log.info(`Service "${service.name}" was deregistered.`)
      // Remove service from service store.
      services.splice(services.indexOf(service), 1)
      // Fire services changed event
      servicesChanged(true)
      return Promise.resolve()
    })
    .catch(error => log.error(`Unable to stop service "${service.name}"`, error))

  const onServiceChanged = (broker, service) => {
    const filename = service.filename

    // Clear the require cache
    Object.keys(require.cache).forEach(key => {
      if (key === filename) {
        delete require.cache[key]
      }
    })

    // Service has changed - 1. destroy the service, then reload it
    destroyService(service)
      .then(() => broker.loadService(filename))
  }

  // broker object
  /**
   * @type {Broker}
  */
  const broker = {
    nodeId,
    version,
    options,
    runtime,
    bus,
    validator,
    contextFactory,
    isStarted: false,
    log,
    createLogger: runtime.createLogger,
    getUUID: () => generateUUID(runtime),
    health,
    registry,
    getNextActionEndpoint (actionName, options = {}) {
      return registry.getNextAvailableActionEndpoint(actionName, options)
    },
    emit: eventBus.emit.bind(this),
    broadcast: eventBus.broadcast.bind(this),
    broadcastLocal: eventBus.broadcastLocal.bind(this),
    call: runtime.actionInvoker.call.bind(this),
    multiCall: runtime.actionInvoker.multiCall.bind(this),
    waitForServices: services.waitForServices.bind(this),
    /**
     * Call a action.
     * @param {*} actionName Name of the action.
     * @param {*} data Action parameters
     * @param {*} [opts={}] Options
     * @returns {Promise} Promise
    */
    createService (schema) {
      try {
        const newService = createServiceFromSchema(runtime, middlewareHandler, registerLocalService, schema)

        // if the broker is already startet - start the service.
        if (this.isStarted) {
          newService.start()
            .catch(error => log.error(`Unable to start service ${newService.name}: ${error}`))
        }
        return newService
      } catch (error) {
        log.error(error)
        this.handleError(error)
      }
    },
    /**
     * Load and register a service from file.
     * @param {string} fileName Path to the service file.
     * @returns {Service} Service
    */
    loadService (fileName) {
      const filePath = path.resolve(fileName)
      const schema = require(filePath)
      const service = this.createService(schema)

      // If the "watchSevrices" option is set - add service to service watcher.
      if (options.watchServices) {
        service.filename = fileName
        serviceWatcher.call(this, service, onServiceChanged)
      }

      return service
    },
    /**
     * Load services from a folder.
     * @param {string} [folder='./services'] Path of the folder.
     * @param {string} [fileMask='*.service.js'] Pattern of the service files
     * @returns {number} Amount of services
    */
    loadServices (folder = './services', fileMask = '*.service.js') {
      const serviceFiles = glob.sync(path.join(folder, fileMask))

      log.info(`Searching services in folder '${folder}' with name pattern '${fileMask}'.`)
      log.info(`${serviceFiles.length} services found.`)

      serviceFiles.forEach(fileName => this.loadService(fileName))
      return serviceFiles.length
    },
    /**
     * Wait for services before continuing startup.
     * @param {Array.<string>} serviceNames Names of the services
     * @param {Number} timeout Time in Miliseconds before the broker stops.
     * @param {Number} interval Time in Miliseconds to check for services.
     * @returns {Promise} Promise
    */

    /**
     * Starts the broker.
     * @returns {Promise} Promise
    */
    async start () {
      const startTime = Date.now()
      await middlewareHandler.callHandlersAsync('starting', [runtime], true)

      if (transport) {
        await transport.connect()
      }

      try {
        await Promise.all(services.serviceList.map(service => service.start()))
      } catch (error) {
        log.error('Unable to start all services', error)
        clearInterval(options.waitForServiceInterval)
        handleError(error)
      }

      runtime.state.isStarted = true
      eventBus.broadcastLocal('$broker.started')
      registry.generateLocalNodeInfo(true)

      if (transport) {
        await transport.setReady()
      }

      await middlewareHandler.callHandlersAsync('started', [runtime], true)

      if (runtime.state.isStarted && isFunction(options.started)) {
        options.started.call(this)
      }

      const duration = Date.now() - startTime
      log.info(`Node "${nodeId}" with ${services.length} services successfully started in ${duration}ms.`)
    },
    /**
     * Stops the broker.
     * @returns {Promise} Promise
    */
    async stop () {
      runtime.state.isStarted = false
      log.info('Shutting down the node...')

      await middlewareHandler.callHandlersAsync('stopping', [runtime], true)

      try {
        await Promise.all(services.serviceList.map(service => service.stop()))
      } catch (error) {
        log.error('Unable to stop all services.', error)
        throw error
      }

      if (transport) {
        await transport.disconnect()
      }

      if (runtime.cache) {
        log.debug('Stopping caching adapters.')
        await cache.stop()
      }

      if (runtime.tracer) {
        log.debug('Stopping tracing adapters.')
        await runtime.tracer.stop()
      }

      await middlewareHandler.callHandlersAsync('stopped', [runtime], true)

      if (!runtime.state.isStarted && isFunction(options.stopped)) {
        options.stopped.call(runtime)
      }

      log.info('The node was successfully shut down. Bye bye! 👋')

      eventBus.broadcastLocal('$broker.closed')

      process.removeListener('beforeExit', onClose)
      process.removeListener('exit', onClose)
      process.removeListener('SIGINT', onClose)
      process.removeListener('SIGTERM', onClose)
    },
    /**
     * Send a ping to connected nodes.
     * @param {*} nodeId Node id
     * @param {number} [timeout=3000] Ping timeout
     * @returns {Array} Ping result
    */
    ping (nodeId, timeout = 3000) {
      if (transport && transport.isConnected) {
        if (nodeId) {
          return new Promise((resolve) => {
            const timeoutTimer = setTimeout(() => {
              bus.off('$node.pong', pongHandler)
              return resolve(null)
            }, timeout)

            const pongHandler = pong => {
              clearTimeout(timeoutTimer)
              bus.off('$node.pong', pongHandler)
              resolve(pong)
            }

            bus.on('$node.pong', pongHandler)
            transport.sendPing(nodeId)
          })
        } else {
          // handle arrays
          const pongs = {}

          const nodes = registry.getNodeList({})
            .filter(node => !node.isLocal)
            .map(node => node.id)

          const onFlight = new Set(nodes)

          nodes.forEach(nodeId => {
            pongs[nodeId] = null
          })

          return new Promise((resolve) => {
            // todo: handle timeout
            const timeoutTimer = setTimeout(() => {
              bus.off('$node.pong', pongHandler)
              resolve(pongs)
            }, timeout)

            const pongHandler = pong => {
              pongs[pong.nodeId] = pong
              onFlight.delete(pong.nodeId)
              if (onFlight.size === 0) {
                clearTimeout(timeoutTimer)
                bus.off('$node.pong', pongHandler)
                resolve(pongs)
              }
            }

            bus.on('$node.pong', pongHandler)
            nodes.map(nodeId => transport.sendPing(nodeId))
          })
        }
      }

      return Promise.resolve(nodeId ? null : {})
    },
    /**
     * Global error handler of the broker.
     * @param {*} error Error
     * @returns {void}
     */
    handleError: runtime.handleError,
    fatalError: runtime.fatalError
  }

  // Register internal broker events
  broker.bus.on('$node.disconnected', ({ nodeId }) => {
    runtime.transport.removePendingRequestsByNodeId(nodeId)
    servicesChanged(false)
  })

  // Metrics module
  // broker.metrics = MetricsStorage(broker, options.metrics)
  // broker.metrics.init()
  // registerMetrics(broker)

  // Module initialisation
  // registry.init(broker, middlewareHandler, servicesChanged)
  // middlewareHandler.init(broker)
  // contextFactory.init(broker)
  // health.init(broker, broker.transport)

  // Initialize caching module
  // if (options.cache.enabled) {
  //   const createCache = Cache.resolve(options.cache.adapter)
  //   broker.cache = createCache(broker, options.cache)
  //   broker.cache.init()
  //   log.info(`Cache module: ${broker.cache.name}`)
  // }

  // // Initialize tracing module
  // if (options.tracing.enabled) {
  //   broker.tracer = Tracer()
  //   broker.tracer.init(broker, options.tracing)
  // }

  /**
   * Register middlewares
   * @param {Array<Object>} customMiddlewares Array of user defined middlewares
   * @returns {void}
   */
  const registerMiddlewares = customMiddlewares => {
    // Register custom middlewares
    if (Array.isArray(customMiddlewares) && customMiddlewares.length > 0) {
      customMiddlewares.forEach(middleware => middlewareHandler.add(middleware))
    }

    // Add the built-in middlewares. (The order is important)
    if (options.loadInternalMiddlewares) {
      middlewareHandler.add(Middlewares.ActionHooks)

      // Validator middleware
      if (options.validateActionParams && validator) {
        middlewareHandler.add(validator.middleware)
      }

      // Bulkhead
      if (options.bulkhead.enabled) {
        middlewareHandler.add(Middlewares.Bulkhead)
      }

      // Cache
      if (broker.cache) {
        middlewareHandler.add(broker.cache.middleware)
      }

      if (options.contextTracking.enabled) {
        middlewareHandler.add(Middlewares.PendingContextTracker)
      }

      if (options.circuitBreaker.enabled) {
        middlewareHandler.add(Middlewares.CircuitBreaker)
      }

      middlewareHandler.add(Middlewares.Timeout)

      if (options.retryPolicy.enabled) {
        middlewareHandler.add(Middlewares.Retry)
      }

      middlewareHandler.add(Middlewares.ErrorHandler)

      if (options.tracing.enabled) {
        middlewareHandler.add(Middlewares.Tracing)
      }

      if (options.metrics.enabled) {
        middlewareHandler.add(Middlewares.Metrics)
      }
    }

    // Wrap runtime and broker methods for middlewares
    runtime.actionInvoker.call = middlewareHandler.wrapMethod('call', runtime.actionInvoker.call)
    runtime.actionInvoker.multiCall = middlewareHandler.wrapMethod('multiCall', broker.multiCall)
    runtime.eventBus.emit = middlewareHandler.wrapMethod('emit', runtime.eventBus.emit)
    runtime.eventBus.broadcast = middlewareHandler.wrapMethod('broadcast', runtime.eventBus.broadcast)
    runtime.eventBus.broadcastLocal = middlewareHandler.wrapMethod('broadcastLocal', runtime.eventBus.broadcastLocal)
    broker.createService = middlewareHandler.wrapMethod('createService', broker.createService)
    broker.loadService = middlewareHandler.wrapMethod('loadService', broker.loadService)
    broker.loadServices = middlewareHandler.wrapMethod('loadServices', broker.loadServices)
  }

  if (isFunction(options.beforeRegisterMiddlewares)) {
    options.beforeRegisterMiddlewares.call(broker)
  }

  registerMiddlewares(options.middlewares)

  // Stop the broker greaceful
  /* istanbul ignore next */
  const onClose = () => broker.stop()
    .catch(error => broker.log.error(error))
    .then(() => process.exit(0))

  // SIGTERM listener
  process.setMaxListeners(0)
  process.on('beforeExit', onClose)
  process.on('exit', onClose)
  process.on('SIGINT', onClose)
  process.on('SIGTERM', onClose)

  // Create internal services
  if (options.loadNodeService) {
    broker.createService(require('../services/node.service'))
  }

  Object.assign(runtime, { broker })

  // Call middleware hook for broker created.
  middlewareHandler.callHandlersSync('created', [runtime])

  // Attach the broker to the runtime object.

  return broker
}

