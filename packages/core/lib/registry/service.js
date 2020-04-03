const { isFunction, isObject, forIn, cloneDeep } = require('lodash')
const { mergeSchemas } = require('../utils')
const { lifecycleHook } = require('../constants')
const { promisify } = require('fachwork')
const { WeaveError } = require('../errors')

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} ServiceSchema
 * @property {string} name - Name of the Service.
 * @property {Array.<ServiceSchema>} mixins The mixins option accepts an array of mixin objects. These mixin objects can contain instance options like normal instance objects, and they will be merged against the eventual options using the same option merging logic in Vue.extend(). e.g. If your mixin contains a created hook and the component itself also has one, both functions will be called.
 * @property {object} settings - Indicates whether the Power component is present.
 * @property {object} actions - Indicates whether the Wisdom component is present.
 * @property {Array.<string>} dependencies Names of the services on which this service depends.
 * @property {object>} settings A storage where settings for this service can be stored. Accessible via "this.settings".
 * @property {function():void} created Hook that is called before the service is created.
 * @property {function():promise} started Hook that is called before the service is started.
 * @property {function():promise} stopped Hook that is called before the service is stopped.
 */

const createService = (broker, middlewareHandler, addLocalService, registerLocalService, schema) => {
  const self = Object.create(null)

  // Check if a schema is given
  if (!schema) {
    throw new WeaveError('Schema is missing!')
  }

  if (schema.mixins) {
    schema = applyMixins(schema)
  }

  if (!schema.name) {
    throw new WeaveError('Service name is missing!')
  }

  self.broker = broker
  self.version = schema.version
  self.name = schema.name
  self.fullyQualifiedName = self.version ? `${self.name}.${self.version}` : self.name
  self.schema = schema
  self.log = broker.createLogger(`${self.name}-service`, self)
  self.settings = schema.settings || {}
  self.meta = schema.meta || {}
  self.actions = {}

  const registryItem = {
    name: self.name,
    fullyQualifiedName: self.fullyQualifiedName,
    settings: self.settings,
    meta: self.meta,
    version: self.version,
    actions: {},
    events: {}
  }

  if (schema.beforeCreate) {
    if (isFunction(schema.beforeCreate)) {
      schema.beforeCreate.call(self)
    }

    if (Array.isArray(schema.beforeCreate)) {
      Promise.all(schema.beforeCreate.map(beforeCreate => beforeCreate.call(self)))
    }
  }

  if (isObject(schema.methods)) {
    forIn(schema.methods, (method, name) => {
      if (['log', 'actions', 'log', 'events', 'settings', 'methods', 'dependencies'].includes(name)) {
        throw new WeaveError(`Invalid method name ${name} in service ${self.name}.`)
      }
      self[name] = method.bind(self)
    })
  }

  if (isObject(schema.actions)) {
    forIn(schema.actions, (action, name) => {
      if (isFunction(action)) {
        action = {
          handler: action
        }
      }
      const innerAction = createActionHandler(cloneDeep(action), name)
      registryItem.actions[innerAction.name] = innerAction

      const wrappedAction = middlewareHandler.wrapHandler('localAction', innerAction.handler, innerAction)
      const endpoint = broker.registry.createPrivateEndpoint(innerAction)

      self.actions[name] = (params, options) => {
        const context = broker.contextFactory.create(endpoint, params, options || {})
        return wrappedAction(context)
      }
    })
  }

  if (isObject(schema.events)) {
    forIn(schema.events, (event, name) => {
      if (isFunction(event)) {
        event = {
          handler: event
        }
      } else if (isObject(event)) {
        event = Object.assign({}, event)
      }

      if (!event.handler) {
        throw new WeaveError(`Missing event handler for '${name}' event in service '${self.name}'`)
      }

      if (!event.name) {
        event.name = name
      }

      event.service = self
      const handler = event.handler

      event.handler = (payload, sender, eventName) => {
        // todo: error handling for events
        return handler.apply(self, [payload, sender, eventName])
      }

      registryItem.events[name] = event
    })
  }

  if (schema.created) {
    if (isFunction(schema.created)) {
      schema.created.call(self)
    }

    if (Array.isArray(schema.created)) {
      Promise.all(schema.created.map(createdHook => createdHook.call(self)))
    }
  }

  self.start = () => {
    return Promise.resolve()
      .then(() => {
        return middlewareHandler.callHandlersAsync('serviceStarting', [self])
      })
      .then(() => {
        if (schema.dependencies) {
          return broker.waitForServices(schema.dependencies, self.settings.$dependencyTimeout || 0)
        }
      }).then(() => {
        if (isFunction(schema.started)) {
          return promisify(schema.started, { scope: self })()
        }

        if (Array.isArray(schema.started)) {
          return schema.started
            .map(hook => promisify(hook, { scope: self }))
            .reduce((p, hook) => p.then(hook), Promise.resolve())
          // return Promise.all(schema.started.map(startedHook => promisify(startedHook, { scope: self })()))
        }
      })
      .then(() => {
        registerLocalService(registryItem)
        return null
      })
      .then(() => {
        return middlewareHandler.callHandlersAsync('serviceStarted', [self])
      })
  }

  self.stop = () => {
    self.log.trace(`Stopping service "${self.name}"`)
    return Promise.resolve()
      .then(() => {
        return middlewareHandler.callHandlersAsync('serviceStopping', [self])
      })
      .then(() => {
        if (isFunction(schema.stopped)) {
          return promisify(schema.stopped, { scope: self })()
        }

        if (Array.isArray(schema.stopped)) {
          return schema.stopped
            .map(hook => promisify(hook, { scope: self }))
            .reduce((p, hook) => p.then(hook), Promise.resolve())
        }
      })
      .then(() => {
        return middlewareHandler.callHandlersAsync('serviceStopped', [self])
      })
  }

  middlewareHandler.callHandlersSync('serviceCreated', [self])

  addLocalService(self)

  return self

  function createActionHandler (action, name) {
    const handler = action.handler

    if (!isFunction(handler)) {
      throw new WeaveError(`Missing action handler in ${name} on service ${self.name}.`)
    }

    action.name = self.name + '.' + (action.name || name)
    action.shortName = name

    if (self.version) {
      action.name = `v${self.version}.${action.name}`
    }

    action.service = self
    action.version = self.version
    action.handler = promisify(handler.bind(self))

    return action
  }

  function applyMixins (schema) {
    const mixins = Array.isArray(schema.mixins) ? schema.mixins : [schema.mixins]

    const mixedSchema = Array
      .from(mixins)
      .reverse()
      .reduce((s, mixin) => {
        for (var key in mixin) {
          if (lifecycleHook.includes(key)) {
            mixin[key] = mixin[key].bind(self)
          }
        }
        if (mixin.mixins) {
          mixin = applyMixins(mixin)
        }

        return mergeSchemas(s, mixin)
      }, {})
    return mergeSchemas(mixedSchema, schema)
  }
}

module.exports = createService
