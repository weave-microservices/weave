exports.initEventbus = (runtime) => {
  const { options: brokerOptions, bus, registry, contextFactory } = runtime

  /**
   * Emit a event on all services (grouped and load balanced).
   * @param {String} eventName Name of the event
   * @param {any} payload - Payload
   * @param {*} [options=null] - Groups
   * @returns {Promise<any>} - Result
  */
  const emit = (eventName, payload, options) => {
    if (Array.isArray(options)) {
      options = { groups: options }
    } else if (options == null) {
      options = {}
    }

    const promises = []
    // todo: create an event context object
    const context = contextFactory.create(null, payload, options)

    context.eventType = 'emit'
    context.eventName = eventName
    context.eventGroups = options.groups

    // Emit system events
    if (/^\$/.test(eventName)) {
      bus.emit(eventName, payload)
    }

    const endpoints = registry.eventCollection.getBalancedEndpoints(eventName, options.groups)
    const groupedEndpoints = {}

    endpoints.map(([endpoint, groupName]) => {
      if (endpoint) {
        if (endpoint.node.id === brokerOptions.nodeId) {
          // Local event. Call handler
          promises.push(endpoint.action.handler(context))
        } else {
          const e = groupedEndpoints[endpoint.node.id]
          if (e) {
            e.groups.push(groupName)
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
    if (runtime.transport) {
      Object.values(groupedEndpoints)
        .forEach(groupedEndpoint => {
          const newContext = context.copy()
          newContext.setEndpoint(groupedEndpoint.endpoint)
          newContext.eventGroups = groupedEndpoint.groups
          promises.push(runtime.transport.sendEvent(newContext))
        })
    }

    return Promise.all(promises)
  }

  /**
  * Send a broadcasted event to all local services.
  * @param {String} eventName Name of the event
  * @param {any} payload Payload
  * @param {*} [options=null] Options
  * @returns {Promise<any>} Promise
  */
  const broadcastLocal = (eventName, payload, options) => {
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
      bus.emit(eventName, payload)
    }

    return registry.eventCollection.emitLocal(context)
  }

  /**
  * Send a broadcasted event to all services.
  * @param {String} eventName Name of the event
  * @param {any} payload Payload
  * @param {*} [options=null] Groups
  * @returns {Promise<any>} Promise
  */
  const broadcast = (eventName, payload, options) => {
    if (Array.isArray(options)) {
      options = { groups: options }
    } else if (options == null) {
      options = {}
    }

    const promises = []

    if (runtime.transport) {
      // create context
      // todo: create an event context object
      const context = contextFactory.create(null, payload, options)
      context.eventType = 'broadcast'
      context.eventName = eventName
      context.eventGroups = options.groups

      // Avoid to broadcast internal events.
      if (!/^\$/.test(eventName)) {
        const endpoints = registry.eventCollection.getAllEndpointsUniqueNodes(eventName, options.groups)

        endpoints.map(endpoint => {
          if (endpoint.node.id !== brokerOptions.nodeId) {
            const newContext = context.copy()
            newContext.setEndpoint(endpoint)
            promises.push(runtime.transport.sendEvent(newContext))
          }
        })
      }
    }

    promises.push(broadcastLocal(eventName, payload, options))
    return Promise.all(promises)
  }

  Object.defineProperty(runtime, 'eventBus', {
    value: {
      emit,
      broadcast,
      broadcastLocal
    }
  })
}
