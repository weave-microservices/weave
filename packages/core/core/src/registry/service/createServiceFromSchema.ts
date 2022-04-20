
const { isFunction, clone, isObject, promisify } = require('@weave-js/utils');
const { WeaveError } = require('../../errors');
import { parseActionDefinition } from  './parseActionDefinition';
const { parseEvent } = require('./parseEvent');
import { reduceMixins } from './reduceMixins';
const { createEventEndpoint } = require('../eventEndpoint');
import { Runtime } from '../../runtime/Runtime';
import { Service } from '../../service/Service';
import { ServiceSchema } from '../../service/ServiceSchema';

/**
 * Service factory
 * @param {Runtime} runtime Broker instance
 * @param {ServiceSchema} serviceSchema Service schema
 * @returns {Service} Service instance
 */
exports.createServiceFromSchema = (runtime: Runtime, serviceSchema: ServiceSchema) => {
  // Check if a schema is given
  if (!serviceSchema) {
    runtime.handleError(new WeaveError('Schema is missing!'));
  }

  const service: Service = Object.create(null);
  
  // Set reference to the runtime.
  service.runtime = runtime;

  // Set reference to the broker instance.
  service.broker = runtime.broker;

  // Apply all mixins (including children)
  if (serviceSchema.mixins) {
    serviceSchema = reduceMixins(service, serviceSchema);
  }

  // Call "afterSchemasMerged" service lifecycle hook(s)
  if (serviceSchema.afterSchemasMerged) {
    if (isFunction(serviceSchema.afterSchemasMerged)) {
      serviceSchema.afterSchemasMerged.call(service, serviceSchema);
    } else if (Array.isArray(serviceSchema.afterSchemasMerged)) {
      Promise.all(serviceSchema.afterSchemasMerged.map(afterSchemasMerged => afterSchemasMerged.call(service, serviceSchema)));
    }
  }

  // Call "serviceCreating" middleware hook
  runtime.middlewareHandler.callHandlersSync('serviceCreating', [service, serviceSchema]);

  // validate name
  if (!serviceSchema.name) {
    runtime.handleError(new WeaveError('Service name is missing!'));
  }

  // Set name
  service.name = serviceSchema.name;

  // Set service version
  service.version = serviceSchema.version;

  // Create a full qualified name, including version if set.
  service.fullyQualifiedName = service.version ? `${service.name}.${service.version}` : service.name;

  // Set a reference to the base schema
  service.schema = serviceSchema;

  // Set the service settings
  service.settings = serviceSchema.settings || {};

  // Set the service meta data
  service.meta = serviceSchema.meta || {};

  // Create a separate protocol instance for the service.
  service.log = runtime.createLogger(`${service.name}-service`, {
    svc: service.name,
    version: service.version
  });

  // Action object
  service.actions = {};
  service.events = {};

  // Create the service registry item
  const serviceSpecification = {
    name: service.name,
    fullyQualifiedName: service.fullyQualifiedName,
    settings: service.settings,
    meta: service.meta,
    version: service.version,
    actions: {},
    events: {}
  };

  // Bind service methods to service
  if (serviceSchema.methods && isObject(serviceSchema.methods)) {
    Object.keys(serviceSchema.methods).map(methodName => {
      const method = serviceSchema.methods![methodName];

      // Reserved property names
      if (['log', 'actions', 'meta', 'events', 'settings', 'methods', 'dependencies', 'version', 'dependencies', 'broker', 'runtime', 'afterSchemasMerged', 'created', 'started', 'stopped'].includes(methodName)) {
        runtime.handleError(new WeaveError(`Invalid method name ${methodName} in service ${service.name}.`));
      }

      service[methodName] = method.bind(service);
    });
  }

  // Bind and register service actions
  if (serviceSchema.actions && isObject(serviceSchema.actions)) {
    Object.keys(serviceSchema.actions).map(actionName => {
      const actionDefinition = serviceSchema.actions![actionName];

      // skip actions that are set to false
      if (actionDefinition === false) return;

      const action = parseActionDefinition(runtime, service, clone(actionDefinition), actionName);
      serviceSpecification.actions[action.name] = action;

      const wrappedAction = runtime.middlewareHandler.wrapHandler('localAction', action.handler, action);

      // Make the action accessable via this.actions["actionName"]
      service.actions[actionName] = (data, options) => {
        let context;
        // reuse context
        if (options && options.context) {
          context = options.context;
        } else {
          const endpoint = runtime.registry.createPrivateActionEndpoint(action);
          // create a new context
          context = runtime.contextFactory.create (endpoint, data, options || {});
        }

        return wrappedAction(context, { service, runtime, errors: {}});
      };
    });
  }

  // Bind and register service events
  if (serviceSchema.events && isObject(serviceSchema.events)) {
    Object.keys(serviceSchema.events).map(name => {
      const eventDefinition = serviceSchema.events![name];
      const innerEvent = parseEvent(runtime, service, clone(eventDefinition), name);

      serviceSpecification.events[name] = innerEvent;

      // wrap event
      const wrappedEvent = runtime.middlewareHandler.wrapHandler('localEvent', innerEvent.handler, innerEvent);

      // Add local event handler
      service.events[name] = (data, options) => {
        let context;
        if (options && options.context) {
          context = options.context;
        } else {
          // create a local endpoint for the event
          const endpoint = createEventEndpoint(runtime, runtime.registry.nodeCollection.localNode, innerEvent.service, innerEvent);

          // create a new context
          context = runtime.contextFactory.create(endpoint, data, options || {});
        }

        return wrappedEvent(context);
      };
    });
  }

  // Call "created" service lifecycle hook(s)
  if (serviceSchema.created) {
    if (isFunction(serviceSchema.created)) {
      serviceSchema.created.call(service);
    }

    if (Array.isArray(serviceSchema.created)) {
      Promise.all(serviceSchema.created.map(createdHook => createdHook.call(service)));
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
        if (serviceSchema.dependencies) {
          return runtime.services.waitForServices(serviceSchema.dependencies, service.settings.$dependencyTimeout || 0);
        }
      }).then(() => {
        if (serviceSchema.started && isFunction(serviceSchema.started)) {
          return promisify(serviceSchema.started.bind(service))();
        }

        if (Array.isArray(serviceSchema.started)) {
          return serviceSchema.started
            .map(hook => promisify(hook.bind(service)))
            .reduce((p, hook) => p.then(hook), Promise.resolve());
        }
      })
      .then(() => runtime.registry.registerLocalService(serviceSpecification))
      .then(() => runtime.middlewareHandler.callHandlersAsync('serviceStarted', [service]));
  };

  // stop method for service
  service.stop = () => {
    service.log.info(`Stopping service "${service.fullyQualifiedName}"...`);
    return Promise.resolve()
      .then(() => {
        return runtime.middlewareHandler.callHandlersAsync('serviceStopping', [service]);
      })
      .then(() => {
        if (serviceSchema.stopped && isFunction(serviceSchema.stopped)) {
          return promisify(serviceSchema.stopped.bind(service, service))();
        }

        if (Array.isArray(serviceSchema.stopped)) {
          return serviceSchema.stopped
            .map(hook => promisify(hook.bind(service)))
            .reduce((p, hook) => p.then(hook), Promise.resolve());
        }
      })
      .then(() => runtime.middlewareHandler.callHandlersAsync('serviceStopped', [service], { reverse: true }))
      .then(() => service.log.info(`Service "${service.name}" stopped`));
  };

  runtime.middlewareHandler.callHandlersSync('serviceCreated', [service, serviceSchema]);

  // Add service to brokers local map
  runtime.services.serviceList.push(service);

  return service;
};
