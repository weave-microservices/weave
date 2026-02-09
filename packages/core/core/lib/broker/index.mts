import { isFunction } from "@weave-js/utils";
import path from "path";
import { globSync } from "glob";
import * as Middlewares from "../middlewares/index.mts";
import type {
  Runtime,
  Broker,
  Service,
  ServiceSchema,
  ActionOptions,
  EventOptions,
  Endpoint,
  PingResult,
  Middleware,
  Registry,
  NodeCollection,
  EventBus,
  Node,
} from "../../types/index.js";

/**
 * Creates a new Weave Broker instance from the provided runtime
 * @param runtime - Initialized Weave runtime containing all core components
 * @returns A fully configured Broker instance ready for use
 */
export const createBrokerInstance = (runtime: Runtime): Broker => {
  const {
    version,
    options,
    bus,
    eventBus,
    middlewareHandler,
    registry,
    contextFactory,
    validator,
    log,
    services,
    transport,
  } = runtime;

  log.info(`Initializing #weave node version ${version}`);
  log.info(`Node Id: ${options.nodeId}`);

  if (options.namespace) {
    log.info(`Namespace: ${options.namespace}`);
  }

  if (runtime.metrics) {
    runtime.metrics.init();
  }

  if (runtime.cache) {
    runtime.cache.init();
  }

  const broker = Object.create(null) as Broker;

  broker.runtime = runtime;
  broker.registry = registry;
  broker.bus = bus;
  broker.nodeId = options.nodeId!;
  broker.version = version;
  broker.options = options;
  broker.validator = validator;
  broker.contextFactory = contextFactory!;
  broker.log = log;
  broker.createLogger = runtime.createLogger!;

  broker.getUUID = function (): string {
    return runtime.generateUUID();
  };

  broker.getNextActionEndpoint = function (
    actionName: string,
    options: Record<string, unknown> = {},
  ): Endpoint | Error {
    return registry.getNextAvailableActionEndpoint(actionName, options);
  };

  broker.emit = eventBus!.emit.bind(broker);

  broker.broadcast = eventBus!.broadcast.bind(broker);

  broker.broadcastLocal = eventBus!.broadcastLocal.bind(broker) as (
    eventName: string,
    payload?: unknown,
    options?: EventOptions,
  ) => Promise<void>;

  broker.call = runtime.actionInvoker.call.bind(broker);

  broker.multiCall = runtime.actionInvoker.multiCall.bind(broker);

  broker.waitForServices = services!.waitForServices.bind(broker);

  broker.createService = services!.createService.bind(broker);

  /**
   * Global error handler for the broker. Processes non-fatal errors and passes them to the configured error handler.
   * @param error - The error to handle
   */
  broker.handleError = runtime.handleError;

  /**
   * Fatal error handler that triggers graceful shutdown. Should only be used for unrecoverable errors.
   * @param message - Error message describing the fatal condition
   * @param error - The underlying error that caused the fatal condition
   * @param killProcess - Whether to terminate the process after cleanup
   */
  broker.fatalError = runtime.fatalError;

  /**
   * Loads and registers a service from a file path. The file should export a service schema.
   * @param filename - Absolute or relative path to the service file
   * @returns The created and registered service instance
   * @throws When the service file cannot be loaded or contains invalid schema
   * @example
   * // Load a service from a file
   * const service = broker.loadService('./services/math.service.js');
   */
  broker.loadService = function (filename: string): Service | undefined {
    const filePath = path.resolve(filename);
    const schema = require(filePath);
    const service = broker.createService(schema);

    if (service) {
      service.filename = filename;
    }

    return service;
  };

  broker.loadServices = function (
    folder: string = "./services",
    fileMask: string = "*.service.js",
  ): number {
    const serviceFiles = globSync(path.join(folder, fileMask));

    log.debug(`Searching services in folder '${folder}' with name pattern '${fileMask}'.`);
    log.debug(`${serviceFiles.length} services found.`);

    serviceFiles.forEach((fileName) => broker.loadService(fileName));
    return serviceFiles.length;
  };

  /**
   * Starts the broker.
   * @returns Promise that resolves when broker is started
   */
  broker.start = async function (): Promise<void> {
    const startTime = Date.now();
    await middlewareHandler!.callHandlersAsync("starting", [runtime], true);

    if (transport) {
      await transport.connect();
    }

    // Start services using Promise.allSettled to continue even if some fail
    const serviceStartResults = await Promise.allSettled(
      services.serviceList.map((service) => service.start()),
    );

    const failedServices = serviceStartResults
      .map((result, index) => ({ result, service: services!.serviceList[index] }))
      .filter(({ result }) => result.status === "rejected") as Array<{
      result: PromiseRejectedResult;
      service: Service;
    }>;

    if (failedServices.length > 0) {
      const errorMessage = `Failed to start ${failedServices.length} of ${services!.serviceList.length} services`;

      failedServices.forEach(({ result, service }) => {
        log.error(result.reason, `Unable to start service "${service.name}"`);
      });

      clearInterval(options.waitForServiceInterval);

      // If critical services failed, throw error to prevent startup
      if (failedServices.some(({ service }) => (service.schema as any).critical !== false)) {
        const criticalFailures = failedServices.filter(
          ({ service }) => (service.schema as any).critical !== false,
        );

        // If only one service failed, preserve the original error message for compatibility
        if (criticalFailures.length === 1 && services!.serviceList.length === 1) {
          throw criticalFailures[0].result.reason;
        } else {
          throw new Error(
            `${errorMessage}. Critical services failed: ${criticalFailures.map(({ service }) => service.name).join(", ")}`,
          );
        }
      } else {
        log.warn(`${errorMessage}, but continuing startup as no critical services failed`);
      }
    }

    runtime.state.isStarted = true;
    eventBus!.broadcastLocal("$broker.started");
    (registry as any).generateLocalNodeInfo(true);

    if (transport) {
      await transport.setReady();
    }

    await middlewareHandler!.callHandlersAsync("started", [runtime], true);

    if (runtime.state.isStarted && isFunction(options.started)) {
      options.started.call(broker);
    }

    const duration = Date.now() - startTime;
    log.info(
      `Node "${options.nodeId}" with ${services!.serviceList.length} services successfully started in ${duration}ms.`,
    );
  };

  /**
   * Stops the broker.
   * @returns Promise that resolves when broker is stopped
   */
  broker.stop = async function (): Promise<void> {
    runtime.state.isStarted = false;
    log.info("Shutting down the node");

    await middlewareHandler!.callHandlersAsync("stopping", [runtime], true);

    // Stop services using Promise.allSettled to attempt stopping all services
    const serviceStopResults = await Promise.allSettled(
      services!.serviceList.map((service) => service.stop()),
    );

    const failedStops = serviceStopResults
      .map((result, index) => ({ result, service: services!.serviceList[index] }))
      .filter(({ result }) => result.status === "rejected") as Array<{
      result: PromiseRejectedResult;
      service: Service;
    }>;

    if (failedStops.length > 0) {
      failedStops.forEach(({ result, service }) => {
        log.error(result.reason, `Unable to stop service "${service.name}"`);
      });

      // If only one service and it failed, preserve original error for compatibility
      if (failedStops.length === 1 && services!.serviceList.length === 1) {
        throw failedStops[0].result.reason;
      } else {
        log.error(
          `Failed to stop ${failedStops.length} of ${services!.serviceList.length} services, but continuing shutdown`,
        );
        // Continue with shutdown process rather than throwing
      }
    }

    if (transport) {
      await transport.disconnect();
    }

    if (runtime.cache && runtime.options.cache?.enabled) {
      log.debug("Stopping caching adapters.");
      await runtime.cache.stop();
    }

    if (runtime.metrics && runtime.options.metrics?.enabled) {
      log.debug("Stopping metrics.");
      await runtime.metrics.stop();
    }

    if (runtime.tracer && runtime.options.tracing?.enabled) {
      log.debug("Stopping tracing adapters.");
      await runtime.tracer.stop();
    }

    await middlewareHandler!.callHandlersAsync("stopped", [runtime], true);

    if (!runtime.state.isStarted && isFunction(options.stopped)) {
      options.stopped.call(broker);
    }

    log.info(`The node "${options.nodeId}" was gracefully shut down.`);

    eventBus!.broadcastLocal("$broker.stopped");

    process.removeListener("beforeExit", onClose);
    process.removeListener("exit", onClose);
    process.removeListener("SIGINT", onClose);
    process.removeListener("SIGTERM", onClose);

    // todo: handle errors
  };

  /**
   * Ping other nodes
   * @param nodeId - Node ID to ping (optional - pings all nodes if not provided)
   * @param timeout - Timeout in milliseconds
   * @returns Promise with ping results
   */
  broker.ping = function (
    nodeId?: string,
    timeout: number = 3000,
  ): Promise<PingResult | Record<string, PingResult | null> | null> {
    if (transport && transport.isConnected) {
      if (nodeId) {
        return new Promise<PingResult | null>((resolve) => {
          const timeoutTimer = setTimeout(() => {
            bus.off("$node.pong", pongHandler);
            return resolve(null);
          }, timeout);

          const pongHandler = (pong: PingResult) => {
            clearTimeout(timeoutTimer);
            bus.off("$node.pong", pongHandler);
            resolve(pong);
          };

          bus.on("$node.pong", pongHandler);
          transport!.sendPing(nodeId);
        });
      } else {
        const pongs: Record<string, PingResult | null> = {};

        const nodes = (registry as Registry & { nodeCollection: NodeCollection }).nodeCollection
          .list({})
          .filter((node) => !node.isLocal)
          .map((node) => node.id);

        const onFlight = new Set(nodes);

        nodes.forEach((nodeId) => {
          pongs[nodeId] = null;
        });

        return new Promise<Record<string, PingResult | null>>((resolve) => {
          // todo: handle timeout
          const timeoutTimer = setTimeout(() => {
            bus.off("$node.pong", pongHandler);
            resolve(pongs);
          }, timeout);

          const pongHandler = (pong: PingResult) => {
            pongs[pong.nodeId] = pong;
            onFlight.delete(pong.nodeId);
            if (onFlight.size === 0) {
              clearTimeout(timeoutTimer);
              bus.off("$node.pong", pongHandler);
              resolve(pongs);
            }
          };

          bus.on("$node.pong", pongHandler);
          nodes.map((nodeId: string) => transport!.sendPing(nodeId));
        });
      }
    }

    return Promise.resolve(nodeId ? null : {});
  };

  broker.bus.on("$node.disconnected", ({ nodeId }: { nodeId: string }) => {
    runtime.transport!.removePendingRequestsByNodeId(nodeId);
    services!.serviceChanged(false);
  });

  /**
   * Register middlewares
   * @param customMiddlewares - Array of user defined middlewares
   */
  const registerMiddlewares = (customMiddlewares?: Middleware[]): void => {
    if (Array.isArray(customMiddlewares) && customMiddlewares.length > 0) {
      customMiddlewares.forEach((middleware) => middlewareHandler!.add(middleware));
    }

    if (options.loadInternalMiddlewares) {
      middlewareHandler!.add(Middlewares.ActionHooks as unknown as Middleware);

      if (options.validateActionParams && validator) {
        middlewareHandler!.add(Middlewares.Validator as unknown as Middleware);
      }

      if (process.env.NODE_ENV !== "test") {
        middlewareHandler!.add(Middlewares.ContractGenerator as unknown as Middleware);
      }

      if (options.bulkhead?.enabled) {
        middlewareHandler!.add(Middlewares.Bulkhead as unknown as Middleware);
      }

      if (runtime.cache) {
        middlewareHandler!.add(Middlewares.Cache as unknown as Middleware);
      }

      if (options.contextTracking?.enabled) {
        middlewareHandler!.add(Middlewares.ContextTracker as unknown as Middleware);
      }

      if (options.circuitBreaker?.enabled) {
        middlewareHandler!.add(Middlewares.CircuitBreaker as unknown as Middleware);
      }

      middlewareHandler!.add(Middlewares.Timeout as unknown as Middleware);

      if (options.retryPolicy?.enabled) {
        middlewareHandler!.add(Middlewares.Retry as unknown as Middleware);
      }

      middlewareHandler!.add(Middlewares.ErrorHandler as unknown as Middleware);

      if (options.tracing?.enabled) {
        middlewareHandler!.add(Middlewares.Tracing as unknown as Middleware);
      }

      if (options.metrics?.enabled) {
        middlewareHandler!.add(Middlewares.Metrics as unknown as Middleware);
      }
    }

    runtime.actionInvoker.call = middlewareHandler!.wrapMethod("call", runtime.actionInvoker.call);
    runtime.actionInvoker.multiCall = middlewareHandler!.wrapMethod("multiCall", broker.multiCall);
    runtime.eventBus!.emit = middlewareHandler!.wrapMethod("emit", runtime.eventBus!.emit);
    runtime.eventBus!.broadcast = middlewareHandler!.wrapMethod(
      "broadcast",
      runtime.eventBus!.broadcast,
    );
    (
      runtime.eventBus as EventBus & {
        broadcastLocal: (eventName: string, payload?: unknown, options?: EventOptions) => void;
      }
    ).broadcastLocal = middlewareHandler!.wrapMethod(
      "broadcastLocal",
      runtime.eventBus!.broadcastLocal,
    );

    broker.createService = middlewareHandler!.wrapMethod("createService", broker.createService);
    broker.loadService = middlewareHandler!.wrapMethod("loadService", broker.loadService);
    broker.loadServices = middlewareHandler!.wrapMethod("loadServices", broker.loadServices);
    broker.ping = middlewareHandler!.wrapMethod("ping", broker.ping);
  };

  if (isFunction(options.beforeRegisterMiddlewares)) {
    (
      options.beforeRegisterMiddlewares as (
        this: Broker,
        args: { broker: Broker; runtime: Runtime },
      ) => void
    ).call(broker, { broker, runtime });
  }

  registerMiddlewares(options.middlewares);

  /* istanbul ignore next */
  const onClose = () =>
    broker
      .stop()
      .catch((error) => broker.log.error(error))
      .then(() => process.exit(0));

  process.setMaxListeners(0);
  process.on("beforeExit", onClose);
  process.on("exit", onClose);
  process.on("SIGINT", onClose);
  process.on("SIGTERM", onClose);

  Object.assign(runtime, { broker });

  middlewareHandler!.callHandlersSync("created", [runtime]);

  return broker;
};
