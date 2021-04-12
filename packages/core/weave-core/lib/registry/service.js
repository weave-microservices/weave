/**
 * @typedef {import("../types").Broker} Broker
 * @typedef {import("../types").ServiceSchema} ServiceSchema
 * @typedef {import("../types").Service} Service
*/

const { mergeSchemas } = require('../utils/options')
const { wrapInArray, isFunction, clone, wrapHandler, isObject, promisify } = require('@weave-js/utils')
const { WeaveError } = require('../errors')

const createAction = (runtime, service, actionDefinition, name) => {
  let action = actionDefinition

  // if the handler is a method (short form), we wrap the method in our handler object.
  if (isFunction(actionDefinition)) {
    action = wrapHandler(actionDefinition)
  } else if (isObject(actionDefinition)) {
    action = clone(actionDefinition)
  } else {
    runtime.handleError(new WeaveError(`Invalid action definition in "${name}" on service "${service.name}".`))
  }

  const handler = action.handler

  // Action handler has to be a function
  if (!isFunction(handler)) {
    runtime.handleError(new WeaveError(`Missing action handler in "${name}" on service "${service.name}".`))
  }

  action.name = service.name + '.' + (action.name || name)
  action.shortName = name

  // if this is a versioned service. The action name is prefixed with the version number.
  if (service.version) {
    action.name = `v${service.version}.${action.name}`
  }

  action.service = service
  action.version = service.version
  action.handler = promisify(handler.bind(service))

  return action
}

const createEvent = (runtime, service, eventDefinition, name) => {
  let event

  // if the handler is a method (short form), we wrap the method in our handler object.
  if (isFunction(eventDefinition)) {
    event = wrapHandler(eventDefinition)
  } else if (isObject(eventDefinition)) {
    event = clone(eventDefinition)
  } else {
    runtime.handleError(new WeaveError(`Invalid event definition "${name}" on service "${service.name}".`))
  }

  // Event handler has to be a function
  if (!isFunction(event.handler) && !Array.isArray(event.handler)) {
    runtime.handleError(new WeaveError(`Missing event handler for "${name}" on service "${service.name}".`))
  }

  event.service = service

  let handler
  if (isFunction(event.handler)) {
    handler = promisify(event.handler.bind(service))
  } else if (Array.isArray(event.handler)) {
    handler = event.handler.map(h => {
      return promisify(h.bind(service))
    })
  }

  if (!event.name) {
    event.name = name
  }

  if (isFunction(handler)) {
    event.handler = (context) => handler(context)
  } else if (Array.isArray(handler)) {
    event.handler = (context) => Promise.all(handler.map(h => h(context)))
  }

  return event
}

const applyMixins = (service, schema) => {
  const mixins = wrapInArray(schema.mixins)
  if (mixins.length > 0) {
    const mixedSchema = Array
      .from(mixins)
      .reverse()
      .reduce((s, mixin) => {
        if (mixin.mixins) {
          mixin = applyMixins(service, mixin)
        }

        for (var key in mixin) {
          // bind scope for life cycle hooks
          if (['created', 'started', 'stopped'].includes(key)) {
            mixin[key] = mixin[key].bind(service)
          }
        }

        return s ? mergeSchemas(s, mixin) : mixin
      }, null)
    return mergeSchemas(mixedSchema, schema)
  }
  return schema
}

/**
 * Service factory
 * @param {Broker} runtime Broker instance
 * @param {ServiceSchema} schema Service schema
 * @returns {Service} Service instance
 */
exports.createServiceFromSchema = (runtime, schema) => {
  /**
   * @type {Service}
  */
  const service = Object.create(null)

  // Set reference to the runtime.
  service.runtime = runtime

  // Set reference to the broker instance.
  service.broker = runtime.broker

  // Create a separate protocol instance for the service.
  service.log = runtime.createLogger(`${service.name}-service`, service)

  // Check if a schema is given
  if (!schema) {
    runtime.handleError(new WeaveError('Schema is missing!'))
  }

  // Apply all mixins (including childs)
  if (schema.mixins) {
    schema = applyMixins(service, schema)
  }

  // Call "serviceCreating" middleware hook
  runtime.middlewareHandler.callHandlersSync('serviceCreating', [service, schema])

  // validate name
  if (!schema.name) {
    runtime.handleError(new WeaveError('Service name is missing!'))
  }

  // Set service version
  service.version = schema.version

  // Set name
  service.name = schema.name

  // Create a full qualified name, including version if set.
  service.fullyQualifiedName = service.version ? `${service.name}.${service.version}` : service.name

  // Set a reference to the base schema
  service.schema = schema

  // Set the service settings
  service.settings = schema.settings || {}

  // Set the service meta data
  service.meta = schema.meta || {}

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

  // Call "beforeCreate" service lifecylce hook(s)
  if (schema.beforeCreate) {
    if (isFunction(schema.beforeCreate)) {
      schema.beforeCreate.call(service)
    }

    if (Array.isArray(schema.beforeCreate)) {
      Promise.all(schema.beforeCreate.map(beforeCreate => beforeCreate.call(service)))
    }
  }

  // Bind service methods to context
  if (isObject(schema.methods)) {
    Object.keys(schema.methods).map(name => {
      const method = schema.methods[name]

      if (['log', 'actions', 'meta', 'events', 'settings', 'methods', 'dependencies', 'version', 'dependencies', 'broker', 'runtime', 'created', 'started', 'stopped'].includes(name)) {
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

      const innerAction = createAction(runtime, service, clone(actionDefinition), name)
      serviceSpecification.actions[innerAction.name] = innerAction

      const wrappedAction = runtime.middlewareHandler.wrapHandler('localAction', innerAction.handler, innerAction)
      const endpoint = runtime.registry.createPrivateActionEndpoint(innerAction)

      // Make the action accessable via this.actions["actionName"]
      service.actions[name] = (data, options) => {
        let context
        // reuse context
        if (options && options.context) {
          context = options.context
        } else {
          // create a new context
          context = runtime.contextFactory.create(endpoint, data, options || {})
        }

        return wrappedAction(context)
      }
    })
  }

  // Bind and register service events
  if (isObject(schema.events)) {
    Object.keys(schema.events).map(name => {
      const eventDefinition = schema.events[name]
      const event = createEvent(runtime, service, eventDefinition, name)
      // wrap event

      serviceSpecification.events[name] = event

      service.events[name] = () => {
        return event.handler({})
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
      .then(() => runtime.registry.registerLocalService(serviceSpecification, false))
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
