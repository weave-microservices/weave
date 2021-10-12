/**
 * @typedef {import("../../types").Runtime} Runtime
 * @typedef {import("../../types").ServiceSchema} ServiceSchema
 * @typedef {import("../../types").Service} Service
*/

const { isFunction, clone, isObject, promisify } = require('@weave-js/utils')
const { WeaveError } = require('../../errors')
const { parseAction } = require('./parseAction')
const { parseEvent } = require('./parseEvent')
const { reduceMixins } = require('./reduceMixins')
const { createEventEndpoint } = require('../event-endpoint')
/**
 * Service factory
 * @param {Runtime} runtime Broker instance
 * @param {ServiceSchema} schema Service schema
 * @returns {Service} Service instance
 */
exports.createServiceFromSchema = (runtime, schema) => {
  // Check if a schema is given
  if (!schema) {
    runtime.handleError(new WeaveError('Schema is missing!'))
  }

  /**
   * @type {Service}
  */
  const service = Object.create(null)

  // Set reference to the runtime.
  service.runtime = runtime

  // Set reference to the broker instance.
  service.broker = runtime.broker

  // Apply all mixins (including childs)
  if (schema.mixins) {
    schema = reduceMixins(service, schema)
  }

  // Call "afterSchemasMerged" service lifecylce hook(s)
  if (schema.afterSchemasMerged) {
    if (isFunction(schema.afterSchemasMerged)) {
      schema.afterSchemasMerged.call(service, schema)
    } else if (Array.isArray(schema.afterSchemasMerged)) {
      Promise.all(schema.afterSchemasMerged.map(afterSchemasMerged => afterSchemasMerged.call(service, schema)))
    }
  }

  // Call "serviceCreating" middleware hook
  runtime.middlewareHandler.callHandlersSync('serviceCreating', [service, schema])

  // validate name
  if (!schema.name) {
    runtime.handleError(new WeaveError('Service name is missing!'))
  }

  // Set name
  service.name = schema.name

  // Set service version
  service.version = schema.version

  // Create a full qualified name, including version if set.
  service.fullyQualifiedName = service.version ? `${service.name}.${service.version}` : service.name

  // Set a reference to the base schema
  service.schema = schema

  // Set the service settings
  service.settings = schema.settings || {}

  // Set the service meta data
  service.meta = schema.meta || {}

  // Create a separate protocol instance for the service.
  service.log = runtime.createLogger(`${service.name}-service`, {
    svc: service.name,
    version: service.version
  })

  // Action object
  service.actions = {}
  service.events = {}

  // Create the service registry item
  const serviceSpecification = {
    name: service.name,
    fullyQualifiedName: service.fullyQualifiedName,
    settings: service.settings,
    meta: service.meta,
    version: service.version,
    actions: {},
    events: {}
  }

  // Bind service methods to context
  if (isObject(schema.methods)) {
    Object.keys(schema.methods).map(name => {
      const method = schema.methods[name]

      // Reserved property names
      if (['log', 'actions', 'meta', 'events', 'settings', 'methods', 'dependencies', 'version', 'dependencies', 'broker', 'runtime', 'afterSchemasMerged', 'created', 'started', 'stopped'].includes(name)) {
        runtime.handleError(new WeaveError(`Invalid method name ${name} in service ${service.name}.`))
      }

      service[name] = method.bind(service)
    })
  }

  // Bind and register service actions
  if (isObject(schema.actions)) {
    Object.keys(schema.actions).map(name => {
      const actionDefinition = schema.actions[name]

      // skip actions that are set to false
      if (actionDefinition === false) return

      const innerAction = parseAction(runtime, service, clone(actionDefinition), name)
      serviceSpecification.actions[innerAction.name] = innerAction

      const wrappedAction = runtime.middlewareHandler.wrapHandler('localAction', innerAction.handler, innerAction)

      // Make the action accessable via this.actions["actionName"]
      service.actions[name] = (data, options) => {
        let context
        // reuse context
        if (options && options.context) {
          context = options.context
        } else {
          const endpoint = runtime.registry.createPrivateActionEndpoint(innerAction)
          // create a new context
          context = runtime.contextFactory.create(endpoint, data, options || {})
        }

        return wrappedAction(context, { service, runtime, errors: {} })
      }
    })
  }

  // Bind and register service events
  if (isObject(schema.events)) {
    Object.keys(schema.events).map(name => {
      const eventDefinition = schema.events[name]
      const innerEvent = parseEvent(runtime, service, clone(eventDefinition), name)

      serviceSpecification.events[name] = innerEvent

      // wrap event
      const wrappedEvent = runtime.middlewareHandler.wrapHandler('localEvent', innerEvent.handler, innerEvent)

      // Add local event handler
      service.events[name] = (data, options) => {
        let context
        if (options && options.context) {
          context = options.context
        } else {
          // create a local endpoint for the event
          const endpoint = createEventEndpoint(runtime, runtime.registry.nodeCollection.localNode, innerEvent.service, innerEvent)

          // create a new context
          context = runtime.contextFactory.create(endpoint, data, options || {})
        }

        return wrappedEvent(context)
      }
    })
  }

  // Call "created" service lifecylce hook(s)
  if (schema.created) {
    if (isFunction(schema.created)) {
      schema.created.call(service)
    }

    if (Array.isArray(schema.created)) {
      Promise.all(schema.created.map(createdHook => createdHook.call(service)))
    }
  }

  // start method for service.
  // 1. call "serviceStarting" middleware hook
  // 2. wait for services this service depend on
  // 3. call service started lifecycle hook
  // 4. register service local
  // 5. call "serviceStarted" middleware hook
  service.start = () => {
    return Promise.resolve()
      .then(() => runtime.middlewareHandler.callHandlersAsync('serviceStarting', [service]))
      .then(() => {
        if (schema.dependencies) {
          return runtime.services.waitForServices(schema.dependencies, service.settings.$dependencyTimeout || 0)
        }
      }).then(() => {
        if (isFunction(schema.started)) {
          return promisify(schema.started.bind(service))()
        }

        if (Array.isArray(schema.started)) {
          return schema.started
            .map(hook => promisify(hook.bind(service)))
            .reduce((p, hook) => p.then(hook), Promise.resolve())
        }
      })
      .then(() => runtime.registry.registerLocalService(serviceSpecification))
      .then(() => runtime.middlewareHandler.callHandlersAsync('serviceStarted', [service]))
  }

  // stop method for service
  service.stop = () => {
    service.log.info(`Stopping service "${service.fullyQualifiedName}"...`)
    return Promise.resolve()
      .then(() => {
        return runtime.middlewareHandler.callHandlersAsync('serviceStopping', [service])
      })
      .then(() => {
        if (isFunction(schema.stopped)) {
          return promisify(schema.stopped.bind(service))()
        }

        if (Array.isArray(schema.stopped)) {
          return schema.stopped
            .map(hook => promisify(hook.bind(service)))
            .reduce((p, hook) => p.then(hook), Promise.resolve())
        }
      })
      .then(() => runtime.middlewareHandler.callHandlersAsync('serviceStopped', [service], { reverse: true }))
      .then(() => service.log.info(`Service "${service.name}" stopped`))
  }

  runtime.middlewareHandler.callHandlersSync('serviceCreated', [service, schema])

  // Add service to brokers local map
  runtime.services.serviceList.push(service)

  return service
}
