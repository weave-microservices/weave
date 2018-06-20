const { WeaveError } = require('../../errors')
const { isFunction, isObject, forIn, cloneDeep } = require('lodash')
const { mergeSchemas } = require('../utils')
const { LIFECYCLE_HOOKS } = require('../../constants')
const { promisify } = require('fachwork')

const makeServiceFactory = ({
    addLocalService,
    cacher,
    call,
    contextFactory,
    emit,
    getLogger,
    getNextActionEndpoint,
    log,
    options,
    state,
    validator,
    registry,
    waitForServices,
    wrapAction,
    statistics
}) =>
    (schema) => {
        const self = Object.create(null)

        if (!schema) {
            throw new WeaveError('Schema is missing!')
        }

        // if (schema.created) {
        //     schema.created = promisify(schema.created.bind(self))
        // }

        if (schema.started) {
            schema.started = promisify(schema.started.bind(self))
        }

        if (schema.mixins) {
            schema = applyMixins(schema)
        }

        if (!schema.name) {
            throw new WeaveError('Service name is missing!')
        }

        self.state = state

        self.broker = {
            options: state.options,
            cacher,
            call,
            contextFactory,
            emit,
            getLogger,
            getNextActionEndpoint,
            log,
            validator,
            registry,
            statistics
        }

        self.name = schema.name
        self.schema = schema
        self.log = getLogger(`${self.name}-service`, self)
        self.settings = schema.settings || {}
        self.version = schema.version
        self.actions = {}

        const registryItem = {
            name: self.name,
            settings: self.settings,
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

        if (isObject(schema.actions)) {
            forIn(schema.actions, (action, name) => {
                if (isFunction(action)) {
                    action = {
                        handler: action
                    }
                }
                const innerAction = createActionHandler(cloneDeep(action), name)

                registryItem.actions[innerAction.name] = wrapAction(innerAction)

                self.actions[name] = (params, options) => {
                    const context = contextFactory.create(innerAction, null, params, options || {})
                    context.setParams(params)
                    return innerAction.handler(context)
                }
            })
        }

        if (isObject(schema.methods)) {
            forIn(schema.methods, (method, name) => {
                if (['log', 'actions', 'log', 'events', 'settings', 'methods', 'dependencies'].includes(name)) {
                    throw new WeaveError(`Invalid method name ${name} in service ${self.name}.`)
                }
                self[name] = method.bind(self)
            })
        }

        if (isObject(schema.events)) {
            forIn(schema.events, (event, name) => {
                if (isFunction(event)) {
                    event = {
                        handler: event
                    }
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

        self.started = () => {
            return Promise.resolve()
                .then(() => {
                    if (schema.dependencies) {
                        waitForServices(schema.dependencies, self.settings.dependencyTimeout || 0)
                    }
                }).then(() => {
                    if (isFunction(schema.started)) {
                        return schema.started.call(self)
                    }

                    if (Array.isArray(schema.started)) {
                        return Promise.all(schema.started.map(startHook => startHook()))
                    }
                })
        }

        addLocalService(self, registryItem)

        return self

        function createActionHandler (action, name) {
            const handler = action.handler

            if (!isFunction(handler)) {
                throw new WeaveError(`Missing action handler in ${name} on service ${self.name}.`)
            }

            action.name = self.name + '.' + (action.name || name)

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

            const mixedSchema = mixins.reduce((s, mixin) => {
                for (var key in mixin) {
                    if (LIFECYCLE_HOOKS.includes(key)) {
                        mixin[key] = promisify(mixin[key].bind(self))
                    }
                }
                return mergeSchemas(s, mixin)
            }, {})
            return mergeSchemas(mixedSchema, schema)
        }
    }

module.exports = makeServiceFactory
