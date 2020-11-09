/**
 * Weave service Broker.
 * @module weave
 */

// node packages
const path = require('path')
const fs = require('fs')
const os = require('os')
const glob = require('glob')
const { isFunction, debounce, defaultsDeep, uuid } = require('@weave-js/utils')
const { getDefaultOptions } = require('./default-options')
const { createDefaultLogger } = require('../log/logger')
const { createServiceFromSchema } = require('../registry/service')
const { createDeprecatedWarning } = require('../utils/deprecated-warning')
const { createMiddlewareHandler } = require('./middleware-manager')
const { createRegistry } = require('../registry')
const { createContextFactory } = require('./context-factory')
const Middlewares = require('../middlewares')
const { createValidator } = require('./validator')
const Cache = require('../cache')
const createHealthcheck = require('./health')
const TransportAdapters = require('../transport/adapters')
const { createTransport } = require('../transport/transport-factory')
const EventEmitter = require('eventemitter2')
const { WeaveError } = require('../errors')
const { Tracer } = require('../tracing')
const { MetricsStorage } = require('../metrics')
const { registerMetrics } = require('./broker-metrics')
const { version } = require('../../package.json')

/* eslint-disable no-use-before-define */
/**
 *  Creates a new Weave instance
 * @param {import('./default-options.js').BrokerOptions} options - Service broker options.
 */
/* eslint-enable no-use-before-define */
const createBroker = (options = {}) => {
  // backwards compatibility for logger
  if (options.logger === null) {
    options.logger = {
      enabled: false
    }
  }

  // get default options
  const defaultOptions = getDefaultOptions()

  // merge options with default options
  options = defaultsDeep(options, defaultOptions)

  // started hook is set but is not type of function
  if (options.started && typeof options.started !== 'function') {
    throw new WeaveError('Started hook have to be a function.')
  }

  // stopped hook is set but is not type of function
  if (options.stopped && typeof options.stopped !== 'function') {
    throw new WeaveError('Stopped hook have to be a function.')
  }

  // If no node id is set - create one.
  const nodeId = options.nodeId || `${os.hostname()}-${process.pid}`

  // internal service collection.
  const services = []

  /* eslint-disable no-use-before-define */
  /**
   * Create a new Logger.
   * @param {string} moduleName - Name of the module
   * @param {*} service - Service properties
   * @returns {import('../log/logger.js/index.js').Logger} Logger
   */
  /* eslint-enable no-use-before-define */
  const createLogger = (moduleName, service) => {
    const bindings = {
      nodeId: nodeId
    }

    if (service) {
      bindings.service = service
      if (service.version) {
        bindings.version = service.version
      }
    } else {
      bindings.moduleName = moduleName
    }

    if (typeof options.logger === 'function') {
      return options.logger(bindings, options.logLevel)
    }

    // Only show info in production mode
    if (process.env.NODE_ENV === 'production') {
      options.logger.logLevel = options.logger.logLevel || 'info'
    } else if (process.env.NODE_ENV === 'test') {
      options.logger.logLevel = options.logger.logLevel || 'error'
    } else {
      options.logger.logLevel = options.logger.logLevel || 'debug'
    }

    return createDefaultLogger(options.logger, bindings)
  }

  // Create the default logger for the broker.
  const log = createLogger('WEAVE')

  // Internal modules
  const middlewareHandler = createMiddlewareHandler()
  const registry = createRegistry(middlewareHandler, nodeId, options, createLogger)
  const contextFactory = createContextFactory()
  const health = createHealthcheck()
  const validator = createValidator()

  // Internal Methods
  const addLocalServices = service => {
    services.push(service)
  }

  const servicesChanged = isLocalService => {
    // Send local notification.
    broker.broadcastLocal('$services.changed', { isLocalService })

    // If the service is a local service - send current node informations to other nodes
    if (broker.isStarted && isLocalService && broker.transport) {
      broker.transport.sendNodeInfo()
    }
  }

  const registerLocalService = (registryItem, notify = false) => {
    registry.registerLocalService(registryItem)
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

  const destroyService = service => Promise.resolve()
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

  // Log Messages
  log.info(`Initializing #weave node version ${version}`)
  log.info(`Node Id: ${nodeId}`)

  if (options.namespace) {
    log.info(`Namespace: ${options.namespace}`)
  }

  // broker object
  const broker = {
    /**
    * Event bus
    * @returns {EventEmitter} Service object.
    */
    bus: new EventEmitter({
      wildcard: true,
      maxListeners: 1000
    }),
    version,
    options,
    nodeId,
    contextFactory,
    isStarted: false,
    log,
    createLogger,
    getLogger: function () {
      createDeprecatedWarning('The method "broker.getLogger()" is deprecated since weave version 0.7.0. Please use "broker.createLogger()" instead.')
      return createLogger(...arguments)
    },
    getUUID () {
      if (broker.options.uuidFactory && isFunction(broker.options.uuidFactory)) {
        return broker.options.uuidFactory(broker)
      }
      return uuid()
    },
    health,
    registry,
    getNextActionEndpoint (actionName, options = {}) {
      return registry.getNextAvailableActionEndpoint(actionName, options)
    },
    /**
     * Call a action.
     * @param {*} actionName Name of the action.
     * @param {*} data Action parameters
     * @param {*} [opts={}] Options
     * @returns {Promise} Promise
    */
    call (actionName, data, opts = {}) {
      const endpoint = registry.getNextAvailableActionEndpoint(actionName, opts)

      if (endpoint instanceof Error) {
        return Promise.reject(endpoint)
      }

      const action = endpoint.action
      const nodeId = endpoint.node.id
      let context

      if (opts.context !== undefined) {
        context = opts.context
        context.nodeId = nodeId
      } else {
        context = contextFactory.create(endpoint, data, opts)
      }

      if (endpoint.isLocal) {
        log.debug('Call action local.', { action: actionName, requestId: context.requestId })
      } else {
        log.debug('Call action on remote node.', { action: actionName, nodeId, requestId: context.requestId })
      }

      const p = action.handler(context, endpoint.service, broker)

      p.context = context

      return p
    },
    /**
     * Call multiple actions.
     * @param {Array<Action>} actions Array of actions.
     * @returns {Promise} Promise
    */
    multiCall (actions) {
      if (Array.isArray(actions)) {
        return Promise.all(actions.map(item => this.call(item.actionName, item.params, item.options)))
      } else {
        return Promise.reject(new WeaveError('Actions need to be an Array'))
      }
    },
    /**
     * Emit a event on all services (grouped and load balanced).
     * @param {String} eventName Name of the event
     * @param {any} payload Payload
     * @param {*} [options=null] Groups
     * @returns {void}
     */
    emit (eventName, payload, options) {
      if (Array.isArray(options)) {
        options = { groups: options }
      } else if (options == null) {
        options = {}
      }

      const promises = []
      const context = contextFactory.create(null, payload, options)

      context.eventType = 'emit'
      context.eventName = eventName
      context.eventGroups = options.groups

      // Emit system events
      if (/^\$/.test(eventName)) {
        this.bus.emit(eventName, payload)
      }

      const endpoints = registry.events.getBalancedEndpoints(eventName, options.groups)
      const groupedEndpoints = {}

      endpoints.map(([endpoint, groupName]) => {
        if (endpoint) {
          if (endpoint.node.id === this.nodeId) {
            // Local event. Call handler
            promises.push(endpoint.action.handler(context))
          } else {
            const e = groupedEndpoints[endpoint.node.id]
            if (e) {
              e.push(groupName)
            } else {
              groupedEndpoints[endpoint.node.id] = {
                endpoint,
                groups: [groupName]
              }
            }
          }
        }
      })

      // send remote events
      if (this.transport) {
        Object.values(groupedEndpoints)
          .forEach(groupedEndpoint => {
            const newContext = context.copy()
            newContext.setEndpoint(groupedEndpoint.endpoint)
            newContext.eventGroups = groupedEndpoint.groups
            promises.push(this.transport.sendEvent(newContext))
          })
        // this.transport.sendBalancedEvent(eventName, payload, groupedEndpoints)
      }

      return Promise.all(promises)
    },
    /**
     * Send a broadcasted event to all services.
     * @param {String} eventName Name of the event
     * @param {any} payload Payload
     * @param {*} [options=null] Groups
     * @returns {void}
    */
    broadcast (eventName, payload, options) {
      if (Array.isArray(options)) {
        options = { groups: options }
      } else if (options == null) {
        options = {}
      }

      const promises = []

      if (this.transport) {
        // create context
        // todo: create an event context object
        const context = contextFactory.create(null, payload, options)
        context.eventType = 'broadcast'
        context.eventName = eventName
        context.eventGroups = options.groups

        // Avoid to broadcast internal events.
        if (!/^\$/.test(eventName)) {
          const endpoints = registry.events.getAllEndpointsUniqueNodes(eventName, options.groups)

          endpoints.map(endpoint => {
            if (endpoint.node.id !== this.nodeId) {
              const newContext = context.copy()
              newContext.setEndpoint(endpoint)
              promises.push(this.transport.sendEvent(newContext))
            }
          })
        }
      }

      promises.push(this.broadcastLocal(eventName, payload, options))
      return Promise.all(promises)
    },
    /**
    *Send a broadcasted event to all local services.
    * @param {String} eventName Name of the event
    * @param {any} payload Payload
    * @param {*} [options=null] Options
    * @returns {void}
    */
    broadcastLocal (eventName, payload, options) {
      // If the given group is no array - wrap it.
      if (Array.isArray(options)) {
        options = { groups: options }
      } else if (options == null) {
        options = {}
      }

      const context = contextFactory.create(null, payload, options)
      context.eventType = 'broadcastLocal'
      context.eventName = eventName

      // Emit the event on the internal event bus
      if (/^\$/.test(eventName)) {
        this.bus.emit(eventName, payload)
      }

      return registry.events.emitLocal(context)
    },
    /* eslint-disable no-use-before-define */
    /**
     * Create a new Service and add it to the registry
     * @param {import('../registry/service.js').ServiceSchema} schema - Schema of the Service
     * @returns {Service} Service object.
    */
    /* eslint-enable2 no-use-before-define */
    createService (schema) {
      try {
        const newService = createServiceFromSchema(this, middlewareHandler, addLocalServices, registerLocalService, schema)

        // if the broker is already startet - start the service.
        if (this.isStarted) {
          newService.start()
            .catch(error => log.error(`Unable to start service ${newService.name}: ${error}`))
        }
        return newService
      } catch (error) {
        log.error(error)
        throw error
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
      this.log.info(`Searching services in folder '${folder}' with name pattern '${fileMask}'.`)
      this.log.info(`${serviceFiles.length} services found.`)
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
    waitForServices (serviceNames, timeout, interval = 500) {
      if (!Array.isArray(serviceNames)) {
        serviceNames = [serviceNames]
      }

      const startTimestamp = Date.now()
      return new Promise((resolve, reject) => {
        // todo: add timout for service waiter
        this.log.warn(`Waiting for services '${serviceNames.join(',')}'`)

        const serviceCheck = () => {
          const count = serviceNames.filter(serviceName => registry.hasService(serviceName))

          this.log.wait(`${count.length} services of ${serviceNames.length} available. Waiting...`)

          if (count.length === serviceNames.length) {
            return resolve()
          }

          if (timeout && (Date.now() - startTimestamp) > timeout) {
            return reject(new WeaveError('The waiting of the services is interrupted due to a timeout.', 500, 'WAIT_FOR_SERVICE', { services: serviceNames }))
          }

          this.options.waitForServiceInterval = setTimeout(serviceCheck, interval)
        }
        serviceCheck()
      })
    },
    /**
     * Starts the broker.
     * @returns {Promise} Promise
    */
    start () {
      const startTime = Date.now()
      return Promise.resolve()
        .then(() => middlewareHandler.callHandlersAsync('starting', [this], true))
        .then(() => {
          if (this.transport) {
            return this.transport.connect()
          }
        })
        .then(() => {
          return Promise.all(services.map(service => service.start()))
            .catch(error => {
              this.log.error('Unable to start all services', error)
              clearInterval(options.waitForServiceInterval)
              throw error
            })
        })
        .then(() => {
          this.isStarted = true
          this.broadcastLocal('$broker.started')
        })
        .then(() => {
          if (this.transport) {
            return this.transport.setReady()
          }
        })
        .then(() => middlewareHandler.callHandlersAsync('started', [this], true))
        .then(() => {
          if (this.isStarted && options.started && isFunction(options.started)) {
            options.started.call(this)
          }
        })
        .then(() => {
          const duration = Date.now() - startTime
          log.success(`Node "${nodeId}" with ${services.length} services successfully started in ${duration}ms.`)
        })
    },
    /**
     * Stops the broker.
     * @returns {Promise} Promise
    */
    stop () {
      this.isStarted = false
      return Promise.resolve()
        .then(() => {
          log.info('Shutting down the node...')
        })
        .then(() => middlewareHandler.callHandlersAsync('stopping', [this], true))
        .then(() => {
          return Promise.all(services.map(service => service.stop()))
            .catch(error => {
              this.log.error('Unable to stop all services.', error)
              return Promise.reject(error)
            })
        })
        .then(() => {
          if (this.transport) {
            return this.transport.disconnect()
          }
        })
        .then(() => {
          if (this.cache) {
            log.debug('Stopping caching adapters.')
            return this.cache.stop()
          }
        })
        .then(() => {
          if (this.tracer) {
            log.debug('Stopping tracing adapters.')
            return this.tracer.stop()
          }
        })
        .then(() => middlewareHandler.callHandlersAsync('stopped', [this], true))
        .then(() => {
          if (!this.isStarted) {
            if (options.stopped) {
              options.stopped.call(this)
            }
          }
        })
        .then(() => {
          log.success('The node was successfully shut down. Bye bye! 👋')

          this.broadcastLocal('$broker.closed')

          process.removeListener('beforeExit', onClose)
          process.removeListener('exit', onClose)
          process.removeListener('SIGINT', onClose)
          process.removeListener('SIGTERM', onClose)
        })
    },
    /**
     * Send a ping to connected nodes.
     * @param {*} nodeId Node id
     * @param {number} [timeout=3000] Ping timeout
     * @returns {Array} Ping result
    */
    ping (nodeId, timeout = 3000) {
      if (broker.transport && broker.transport.isConnected) {
        if (nodeId) {
          return new Promise((resolve) => {
            const timeoutTimer = setTimeout(() => {
              broker.bus.off('$node.pong', pongHandler)
              return resolve(null)
            }, timeout)

            const pongHandler = pong => {
              clearTimeout(timeoutTimer)
              broker.bus.off('$node.pong', pongHandler)
              resolve(pong)
            }

            broker.bus.on('$node.pong', pongHandler)
            this.transport.sendPing(nodeId)
          })
        } else {
          // handle arrays
          const pongs = {}

          const nodes = this.registry.getNodeList({})
            .filter(node => !node.isLocal)
            .map(node => node.id)

          const onFlight = new Set(nodes)

          nodes.forEach(nodeId => {
            pongs[nodeId] = null
          })

          return new Promise((resolve) => {
            // todo: handle timeout
            const timeoutTimer = setTimeout(() => {
              broker.bus.off('$node.pong', pongHandler)
              resolve(pongs)
            }, timeout)

            const pongHandler = pong => {
              pongs[pong.nodeId] = pong
              onFlight.delete(pong.nodeId)
              if (onFlight.size === 0) {
                clearTimeout(timeoutTimer)
                broker.bus.off('$node.pong', pongHandler)
                resolve(pongs)
              }
            }

            broker.bus.on('$node.pong', pongHandler)
            nodes.map(nodeId => this.transport.sendPing(nodeId))
          })
        }
      }
      return Promise.resolve(nodeId ? null : [])
    },
    fatalError (message, error, killProcess = true) {
      if (options.logger.enabled) {
        log.fatal(message)
      } else {
        console.log(message, error)
      }

      if (killProcess) {
        process.exit(1)
      }
    }
  }

  // Register internal broker events
  broker.bus.on('$node.disconnected', ({ nodeId }) => {
    broker.transport.removePendingRequestsByNodeId(nodeId)
    servicesChanged(false)
  })

  // Resolve the transport adapter
  if (typeof options.transport === 'string') {
    options.transport = {
      adapter: options.transport
    }
  }

  if (options.transport.adapter) {
    const adapter = TransportAdapters.resolve(options.transport)
    if (adapter) {
      broker.transport = createTransport(broker, adapter)
    }
  }

  // const loadBalancingStrategy = LoadBalancing.resolve(options.registry.loadBalancingStrategy)

  // Metrics module
  broker.metrics = MetricsStorage(broker, options.metrics)
  broker.metrics.init()
  registerMetrics(broker)

  // Module initialisation
  registry.init(broker, middlewareHandler, servicesChanged)
  middlewareHandler.init(broker)
  contextFactory.init(broker)
  health.init(broker, broker.transport)

  // Initialize caching module
  if (options.cache.enabled) {
    const createCache = Cache.resolve(options.cache.adapter)
    broker.cache = createCache(broker, options.cache)
    broker.cache.init()
    log.info(`Cache module: ${broker.cache.name}`)
  }

  // Initialize tracing module
  if (options.tracing.enabled) {
    broker.tracer = Tracer()
    broker.tracer.init(broker, options.tracing)
  }

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
      middlewareHandler.add(Middlewares.ActionHooks())

      // Validator middleware
      if (options.validateActionParams && validator) {
        middlewareHandler.add(validator.middleware)
      }

      middlewareHandler.add(Middlewares.Bulkhead())

      if (broker.cache) {
        middlewareHandler.add(broker.cache.middleware)
      }

      middlewareHandler.add(Middlewares.CircuitBreaker())
      middlewareHandler.add(Middlewares.Timeout())
      middlewareHandler.add(Middlewares.Retry())
      middlewareHandler.add(Middlewares.ErrorHandler())
      middlewareHandler.add(Middlewares.Tracing())

      if (options.metrics.enabled) {
        middlewareHandler.add(Middlewares.Metrics())
      }
    }

    // Wrap broker methods for middlewares
    broker.call = middlewareHandler.wrapMethod('call', broker.call)
    broker.multiCall = middlewareHandler.wrapMethod('multiCall', broker.multiCall)
    broker.emit = middlewareHandler.wrapMethod('emit', broker.emit)
    broker.broadcast = middlewareHandler.wrapMethod('broadcast', broker.broadcast)
    broker.broadcastLocal = middlewareHandler.wrapMethod('broadcastLocal', broker.broadcastLocal)
    broker.loadService = middlewareHandler.wrapMethod('loadService', broker.loadService)
    broker.createService = middlewareHandler.wrapMethod('createService', broker.createService)
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

  process.setMaxListeners(0)
  process.on('beforeExit', onClose)
  process.on('exit', onClose)
  process.on('SIGINT', onClose)
  process.on('SIGTERM', onClose)

  // Create internal services
  if (options.loadNodeService) {
    broker.createService(require('../services/node.service'))
  }

  // Call middleware hook for broker created.
  middlewareHandler.callHandlersSync('created', [broker])

  return broker
}

module.exports = createBroker
