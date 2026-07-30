import type { Endpoint, EventOptions, Runtime } from "../../types/index.js";

interface GroupedEndpoint {
  endpoint: Endpoint;
  groups: string[];
}

export const initEventbus = (runtime: Runtime): void => {
  const { options: brokerOptions, bus, registry, contextFactory } = runtime;

  /**
   * Emit a event on all services (grouped and load balanced).
   */
  const emit = async (
    eventName: string,
    payload: unknown,
    options?: EventOptions | string[],
  ): Promise<PromiseSettledResult<unknown>[]> => {
    let opts: EventOptions;
    if (Array.isArray(options)) {
      opts = { groups: options };
    } else if (options == null) {
      opts = {};
    } else {
      opts = options;
    }

    if (/^\$/.test(eventName)) {
      bus.emit(eventName, payload);
    }

    // todo: create an event context object
    const context = contextFactory.create(null, payload, opts);

    context.eventType = "emit";
    context.eventName = eventName;
    context.eventGroups = opts.groups;

    const endpoints = registry.eventCollection.getBalancedEndpoints(eventName, opts.groups);
    const groupedEndpoints: Record<string, GroupedEndpoint> = {};
    const promises: Promise<unknown>[] = [];

    endpoints.map(([endpoint, groupName]: [Endpoint | null, string]) => {
      if (endpoint) {
        if (endpoint.node.id === brokerOptions.nodeId) {
          context.setEndpoint(endpoint);
          promises.push(
            endpoint.action.handler(context, {
              service: endpoint.action.service,
              runtime,
              errors: {},
            }),
          );
        } else {
          const e = groupedEndpoints[endpoint.node.id];
          if (e) {
            e.groups.push(groupName);
          } else {
            groupedEndpoints[endpoint.node.id] = {
              endpoint,
              groups: [groupName],
            };
          }
        }
      }
    });

    if (runtime.transport?.sendEvent) {
      Object.values(groupedEndpoints).forEach((groupedEndpoint) => {
        const newContext = context.copy();
        newContext.setEndpoint(groupedEndpoint.endpoint);
        newContext.eventGroups = groupedEndpoint.groups;
        promises.push(runtime.transport!.sendEvent!(newContext));
      });
    }

    // Use allSettled to ensure all events are attempted even if some fail
    const results = await Promise.allSettled(promises);

    const failures = results.filter(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (failures.length > 0) {
      failures.forEach((failure) => {
        runtime.log.warn(failure.reason, `Failed to emit event "${eventName}" to remote service`);
      });
    }

    return results;
  };

  /**
   * Send a broadcasted event to all local services.
   */
  const broadcastLocal = (
    eventName: string,
    payload: unknown,
    options?: EventOptions | string[],
  ): Promise<void> => {
    let opts: EventOptions;
    if (Array.isArray(options)) {
      opts = { groups: options };
    } else if (options == null) {
      opts = {};
    } else {
      opts = options;
    }

    const context = contextFactory.create(null, payload, opts);
    context.eventType = "broadcastLocal";
    context.eventName = eventName;

    if (/^\$/.test(eventName)) {
      bus.emit(eventName, payload);
    }

    return registry.eventCollection.emitLocal(context);
  };

  /**
   * Send a broadcasted event to all services.
   */
  const broadcast = async (
    eventName: string,
    payload: unknown,
    options?: EventOptions | string[],
  ): Promise<PromiseSettledResult<unknown>[]> => {
    let opts: EventOptions;
    if (Array.isArray(options)) {
      opts = { groups: options };
    } else if (options == null) {
      opts = {};
    } else {
      opts = options;
    }

    const promises: Promise<unknown>[] = [];

    if (runtime.transport?.sendEvent) {
      // todo: create an event context object
      const context = contextFactory.create(null, payload, opts);
      context.eventType = "broadcast";
      context.eventName = eventName;
      context.eventGroups = opts.groups;

      if (!/^\$/.test(eventName)) {
        const endpoints = registry.eventCollection.getAllEndpointsUniqueNodes(
          eventName,
          opts.groups,
        );

        endpoints.map((endpoint: Endpoint) => {
          if (endpoint.node.id !== brokerOptions.nodeId) {
            const newContext = context.copy();
            newContext.setEndpoint(endpoint);
            promises.push(runtime.transport!.sendEvent!(newContext));
          }
        });
      }
    }

    promises.push(broadcastLocal(eventName, payload, options));

    // Use allSettled to ensure all broadcasts are attempted even if some fail
    const results = await Promise.allSettled(promises);

    const failures = results.filter(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (failures.length > 0) {
      failures.forEach((failure) => {
        runtime.log.warn(
          failure.reason,
          `Failed to broadcast event "${eventName}" to remote service`,
        );
      });
    }

    return results;
  };

  Object.defineProperty(runtime, "eventBus", {
    value: {
      emit,
      broadcast,
      broadcastLocal,
    },
  });
};
