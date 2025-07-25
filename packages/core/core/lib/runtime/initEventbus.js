exports.initEventbus = (runtime) => {
  const { options: brokerOptions, bus, registry, contextFactory } = runtime;

  /**
   * Emit a event on all services (grouped and load balanced).
   * @param {String} eventName Name of the event
   * @param {any} payload - Payload
   * @param {*} [options=null] - Groups
   * @returns {Promise<any>} - Result
  */
  const emit = async (eventName, payload, options) => {
    if (Array.isArray(options)) {
      options = { groups: options };
    } else if (options == null) {
      options = {};
    }

    if (/^\$/.test(eventName)) {
      bus.emit(eventName, payload);
    }

    // todo: create an event context object
    const context = contextFactory.create(null, payload, options);

    context.eventType = 'emit';
    context.eventName = eventName;
    context.eventGroups = options.groups;

    const endpoints = registry.eventCollection.getBalancedEndpoints(eventName, options.groups);
    const groupedEndpoints = {};
    const promises = [];

    endpoints.map(([endpoint, groupName]) => {
      if (endpoint) {
        if (endpoint.node.id === brokerOptions.nodeId) {
          context.setEndpoint(endpoint);
          promises.push(endpoint.action.handler(context));
        } else {
          const e = groupedEndpoints[endpoint.node.id];
          if (e) {
            e.groups.push(groupName);
          } else {
            groupedEndpoints[endpoint.node.id] = {
              endpoint,
              groups: [groupName]
            };
          }
        }
      }
    });

    if (runtime.transport) {
      Object.values(groupedEndpoints)
        .forEach(groupedEndpoint => {
          const newContext = context.copy();
          newContext.setEndpoint(groupedEndpoint.endpoint);
          newContext.eventGroups = groupedEndpoint.groups;
          promises.push(runtime.transport.sendEvent(newContext));
        });
    }

    // Use allSettled to ensure all events are attempted even if some fail
    const results = await Promise.allSettled(promises);

    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      failures.forEach(failure => {
        runtime.log.warn(failure.reason, `Failed to emit event "${eventName}" to remote service`);
      });
    }

    return results;
  };

  /**
  * Send a broadcasted event to all local services.
  * @param {String} eventName Name of the event
  * @param {any} payload Payload
  * @param {*} [options=null] Options
  * @returns {Promise<any>} Promise
  */
  const broadcastLocal = (eventName, payload, options) => {
    if (Array.isArray(options)) {
      options = { groups: options };
    } else if (options == null) {
      options = {};
    }

    const context = contextFactory.create(null, payload, options);
    context.eventType = 'broadcastLocal';
    context.eventName = eventName;

    if (/^\$/.test(eventName)) {
      bus.emit(eventName, payload);
    }

    return registry.eventCollection.emitLocal(context);
  };

  /**
  * Send a broadcasted event to all services.
  * @param {String} eventName Name of the event
  * @param {any} payload Payload
  * @param {*} [options=null] Groups
  * @returns {Promise<any>} Promise
  */
  const broadcast = async (eventName, payload, options) => {
    if (Array.isArray(options)) {
      options = { groups: options };
    } else if (options == null) {
      options = {};
    }

    const promises = [];

    if (runtime.transport) {
      // todo: create an event context object
      const context = contextFactory.create(null, payload, options);
      context.eventType = 'broadcast';
      context.eventName = eventName;
      context.eventGroups = options.groups;

      if (!/^\$/.test(eventName)) {
        const endpoints = registry.eventCollection.getAllEndpointsUniqueNodes(eventName, options.groups);

        endpoints.map(endpoint => {
          if (endpoint.node.id !== brokerOptions.nodeId) {
            const newContext = context.copy();
            newContext.setEndpoint(endpoint);
            promises.push(runtime.transport.sendEvent(newContext));
          }
        });
      }
    }

    promises.push(broadcastLocal(eventName, payload, options));

    // Use allSettled to ensure all broadcasts are attempted even if some fail
    const results = await Promise.allSettled(promises);

    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      failures.forEach(failure => {
        runtime.log.warn(failure.reason, `Failed to broadcast event "${eventName}" to remote service`);
      });
    }

    return results;
  };

  Object.defineProperty(runtime, 'eventBus', {
    value: {
      emit,
      broadcast,
      broadcastLocal
    }
  });
};
