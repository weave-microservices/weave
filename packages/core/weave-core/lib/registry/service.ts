import { MiddlewareHandler } from '../broker/middleware'
import { mergeSchemas } from '../utils/options';
import { wrapInArray, isFunction, clone, wrapHandler, isObject, promisify } from '@weave-js/utils';
import { WeaveError } from '../errors';
import { Logger } from '../logger';
import { Broker } from '../shared/interfaces/broker.interface';
import { Service } from '../shared/interfaces/service.interface';
import { ServiceSchema } from '../shared/interfaces/service-schema.interface';
import { ServiceRegistrationObject } from '../shared/types/service-registration-object.type';
import { Context } from '../shared/interfaces/context.interface';
import { ActionOptions } from '../shared/types/action.type';
import { ServiceAction } from '../shared/interfaces/service-action.interface';

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} ServiceSchema
 * @property {string} name - Name of the Service.
 * @property {string} version - Version of the service.
 * @property {object} methods - Private methods of the service
 * @property {Array.<ServiceSchema>} mixins The mixins option accepts an array of mixin objects. These mixin objects can contain instance options like normal instance objects, and they will be merged against the eventual options using the same option merging logic in Vue.extend(). e.g. If your mixin contains a created hook and the component itself also has one, both functions will be called.
 * @property {object} settings - Indicates whether the Power component is present.
 * @property {object} actions - Indicates whether the Wisdom component is present.
 * @property {Array.<string>} dependencies Names of the services on which this service depends.
 * @property {object>} settings A storage where settings for this service can be stored. Accessible via "this.settings".
 * @property {function():void} beforeCreate Hook that is called before the service is created.
 * @property {function():void} created Hook that is called after the service is created.
 * @property {function():promise} started Hook that is called before the service is started.
 * @property {function():promise} stopped Hook that is called before the service is stopped.
*/
function createAction (broker: Broker, service: Service, actionDefinition, name: string): ServiceAction {
    let action = actionDefinition;
    // if the handler is a method (short form), we wrap the method in our handler object.
    if (isFunction(actionDefinition)) {
        action = wrapHandler(actionDefinition);
    }
    else if (isObject(actionDefinition)) {
        action = clone(actionDefinition);
    }
    else {
        broker.handleError(new WeaveError(`Invalid action definition in "${name}" on service "${service.name}".`));
    }

    const handler = action.handler;
    // Action handler has to be a function
    if (!isFunction(handler)) {
        broker.handleError(new WeaveError(`Missing action handler in "${name}" on service "${service.name}".`));
    }
    action.name = service.name + '.' + (action.name || name);
    action.shortName = name;

    // if this is a versioned service. The action name is prefixed with the version number.
    if (service.version) {
        action.name = `v${service.version}.${action.name}`;
    }

    action.service = service;
    action.version = service.version;
    action.handler = promisify(handler.bind(service));

    return action;
};

function createEvent(broker: Broker, service: Service, eventDefinition: any, name: string) {
    let event;

    // if the handler is a method (short form), we wrap the method in our handler object.
    if (isFunction(eventDefinition)) {
        event = wrapHandler(eventDefinition);
    }
    else if (isObject(eventDefinition)) {
        event = clone(eventDefinition);
    }
    else {
        broker.handleError(new WeaveError(`Invalid event definition "${name}" on service "${service.name}".`));
    }
    // Event handler has to be a function
    if (!isFunction(event.handler) && !Array.isArray(event.handler)) {
        broker.handleError(new WeaveError(`Missing event handler for "${name}" on service "${service.name}".`));
    }
    event.service = service;
    let handler;
    if (isFunction(event.handler)) {
        handler = promisify(event.handler.bind(service));
    } else if (Array.isArray(event.handler)) {
        handler = event.handler.map(h => {
            return promisify(h.bind(service));
        });
    }

    if (!event.name) {
        event.name = name;
    }

    if (isFunction(handler)) {
        event.handler = (context) => handler(context);
    } else if (Array.isArray(handler)) {
        event.handler = (context) => Promise.all(handler.map(h => h(context)));
    }

    return event;
};

function applyMixins(service: Service, schema): ServiceSchema {
    const mixins: Array<ServiceSchema> = wrapInArray(schema.mixins);
    if (mixins.length > 0) {
        const mixedSchema = Array
            .from(mixins)
            .reverse()
            .reduce((s, mixin) => {
                if (mixin.mixins) {
                    mixin = applyMixins(service, mixin);
                }

                for (var key in mixin) {
                    // bind scope for life cycle hooks
                    if (['created', 'started', 'stopped'].includes(key)) {
                        mixin[key] = mixin[key].bind(service);
                    }
                }
                return s ? mergeSchemas(s, mixin) : mixin;
        }, null);
        return mergeSchemas(mixedSchema, schema);
    }
    return schema;
};

/**
 * Create and register a new service
 * @param {Broker} broker Broker instance
 * @param {Object} middlewareHandler Middleware handler
 * @param {Function} addLocalService Add Service to the local service map
 * @param {Function} registerLocalService Register service.
 * @param {ServiceSchema} schema Service schema
 * @returns {Object} Service instance
 */
export function createServiceFromSchema(broker: Broker, middlewareHandler: MiddlewareHandler, addLocalService, registerLocalService, schema) {
    const service: Service = Object.create(null);

    // Set reference to the broker instance.
    service.broker = broker;

    // Create a separate protocol instance for the service.
    service.log = broker.createLogger(`${service.name}-service`, service);

    // Check if a schema is given
    if (!schema) {
        broker.handleError(new WeaveError('Schema is missing!'));
    }

    // Apply all mixins (including childs)
    if (schema.mixins) {
        schema = applyMixins(service, schema);
    }

    // Call "serviceCreating" middleware hook
    middlewareHandler.callHandlersSync('serviceCreating', [service, schema]);

    // validate name
    if (!schema.name) {
        broker.handleError(new WeaveError('Service name is missing!'));
    }
    // Set service version
    service.version = schema.version;

    // Set name
    service.name = schema.name;

    // Create a full qualified name, including version if set.
    service.fullyQualifiedName = service.version ? `${service.name}.${service.version}` : service.name;

    // Set a reference to the base schema
    service.schema = schema;

    // Set the service settings
    service.settings = schema.settings || {};

    // Set the service meta data
    service.meta = schema.meta || {};

    // Action object
    service.actions = {};
    service.events = {};

    // Create the service registry item
    const registryItem: ServiceRegistrationObject = {
        name: service.name,
        fullyQualifiedName: service.fullyQualifiedName,
        settings: service.settings,
        meta: service.meta,
        version: service.version,
        actions: {},
        events: {}
    };

    // Call "beforeCreate" service lifecylce hook(s)
    if (schema.beforeCreate) {
        if (isFunction(schema.beforeCreate)) {
            schema.beforeCreate.call(service);
        }
        if (Array.isArray(schema.beforeCreate)) {
            Promise.all(schema.beforeCreate.map(beforeCreate => beforeCreate.call(service)));
        }
    }

    // Bind service methods to context
    if (isObject(schema.methods)) {
        Object.keys(schema.methods).map(name => {
            const method = schema.methods[name];
            if (['log', 'actions', 'meta', 'events', 'settings', 'methods', 'dependencies', 'version', 'dependencies', 'broker', 'created', 'started', 'stopped'].includes(name)) {
                broker.handleError(new WeaveError(`Invalid method name ${name} in service ${service.name}.`));
            }
            service[name] = method.bind(service);
        });
    }

    // Bind and register service actions
    if (isObject(schema.actions)) {
        Object.keys(schema.actions).map(name => {
            const actionDefinition = schema.actions[name];
            // skip actions that are set to false
            if (actionDefinition === false) {
                return;
            }

            const innerAction = createAction(broker, service, clone(actionDefinition), name);
            registryItem.actions[innerAction.name] = innerAction;

            const wrappedAction = middlewareHandler.wrapHandler('localAction', innerAction.handler, innerAction);
            const endpoint = broker.registry.createPrivateActionEndpoint(innerAction);

            // Make the action accessable via this.actions["actionName"]
            service.actions[name] = (data: Object, options: ActionOptions) => {
                let context: Context;
                // reuse context
                if (options && options.context) {
                    context = options.context;
                }
                else {
                    // create a new context
                    context = broker.contextFactory.create(endpoint, data, options || {});
                }

                return wrappedAction(context);
            };
        });
    }

    // Bind and register service events
    if (isObject(schema.events)) {
        Object.keys(schema.events).map(name => {
            const eventDefinition = schema.events[name];
            const event = createEvent(broker, service, eventDefinition, name);
            // wrap event
            registryItem.events[name] = event;
            service.events[name] = () => {
                return event.handler({});
            };
        });
    }

    // Call "created" service lifecylce hook(s)
    if (schema.created) {
        if (isFunction(schema.created)) {
            schema.created.call(service);
        }
        if (Array.isArray(schema.created)) {
            Promise.all(schema.created.map(createdHook => createdHook.call(service)));
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
            .then(() => middlewareHandler.callHandlersAsync('serviceStarting', [service]))
            .then(() => {
            if (schema.dependencies) {
                return broker.waitForServices(schema.dependencies, service.settings.$dependencyTimeout || 0);
            }
        }).then(() => {
            if (isFunction(schema.started)) {
                return promisify(schema.started.bind(service))();
            }
            if (Array.isArray(schema.started)) {
                return schema.started
                    .map(hook => promisify(hook.bind(service)))
                    .reduce((p, hook) => p.then(hook), Promise.resolve());
            }
        })
            .then(() => registerLocalService(registryItem))
            .then(() => middlewareHandler.callHandlersAsync('serviceStarted', [service]));
    };

    // stop method for service
    service.stop = () => {
        service.log.info(`Stopping service "${service.name}"...`);
        return Promise.resolve()
            .then(() => {
            return middlewareHandler.callHandlersAsync('serviceStopping', [service]);
        })
            .then(() => {
            if (isFunction(schema.stopped)) {
                return promisify(schema.stopped.bind(service))();
            }
            if (Array.isArray(schema.stopped)) {
                return schema.stopped
                    .map(hook => promisify(hook.bind(service)))
                    .reduce((p, hook) => p.then(hook), Promise.resolve());
            }
        })
            .then(() => middlewareHandler.callHandlersAsync('serviceStopped', [service], true))
            .then(() => service.log.info(`Service "${service.name}" stopped`));
    };

    middlewareHandler.callHandlersSync('serviceCreated', [service, schema]);

    // Add service to brokers local map
    addLocalService(service);

    return service;
};
