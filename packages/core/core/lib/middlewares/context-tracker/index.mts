import { WeaveGracefulStopTimeoutError } from "../../errors.mts";
import type {
  ActionHandler,
  Context,
  Logger,
  Middleware,
  Runtime,
  Service,
  ServiceInjection,
} from "../../../types/index.js";

export default (runtime: Runtime): Middleware => {
  function addContext(context: Context): void {
    if (context.service) {
      // local actions
      context.service._trackedContexts.push(context);
    } else {
      // remote actions
      runtime.state.trackedContexts.push(context);
    }
  }

  function removeContext(context: Context): void {
    if (context.service) {
      // local actions
      const index = context.service._trackedContexts.indexOf(context);
      if (index !== -1) {
        context.service._trackedContexts.splice(index, 1);
      }
    } else {
      const index = runtime.state.trackedContexts.indexOf(context);
      if (index !== -1) {
        runtime.state.trackedContexts.splice(index, 1);
      }
    }
  }

  function wrapContextTrackerMiddleware(actionHandler: ActionHandler): ActionHandler {
    return function ContextTrackerMiddleware(
      context: Context,
      serviceInjections: ServiceInjection,
    ): Promise<unknown> {
      const isTracked =
        context.options.track === true
          ? context.options.track
          : runtime.options.contextTracking?.enabled;

      if (!isTracked) {
        return actionHandler(context, serviceInjections);
      }

      addContext(context);

      return actionHandler(context, serviceInjections)
        .then((result: unknown) => {
          removeContext(context);
          return result;
        })
        .catch((error: unknown) => {
          removeContext(context);
          throw error;
        });
    };
  }

  function waitingForActiveContexts(
    contextList: Context[],
    log: Logger,
    shutdownTimeout: number,
    service?: Service,
  ): Promise<void> {
    return new Promise((resolve) => {
      if (contextList.length === 0) {
        resolve();
        return;
      }

      let isTimedOut = false;
      const timeout = setTimeout(() => {
        isTimedOut = true;
        log.error(new WeaveGracefulStopTimeoutError(service as Service));
        resolve();
      }, shutdownTimeout);

      let isFirstCheck = true;
      let checkInterval: ReturnType<typeof setInterval> | undefined;

      const checkContexts = (): void => {
        if (contextList.length === 0) {
          clearTimeout(timeout);
          if (checkInterval) {
            clearInterval(checkInterval);
          }
          resolve();
        } else {
          if (isFirstCheck) {
            log.info(`Waiting for ${contextList.length} open Contexts`);
            isFirstCheck = false;
          }
        }
      };

      // Use setInterval instead of recursive setTimeout to prevent stack overflow
      if (!isTimedOut) {
        checkInterval = setInterval(checkContexts, 100);
        checkInterval.unref();
      }
      setImmediate(checkContexts);
    });
  }

  return {
    created(): void {
      // init context-store
      runtime.state.trackedContexts = [];
    },
    serviceStarting(service: Service): void {
      service._trackedContexts = [];
    },

    // Before a local service stopping
    serviceStopping(service: Service): Promise<void> {
      const shutdownTimeout =
        ((service.settings.$shutdownTimeout ??
          service.broker.options.contextTracking?.shutdownTimeout) as number | undefined) ?? 0;
      return waitingForActiveContexts(
        service._trackedContexts,
        service.log,
        shutdownTimeout,
        service,
      );
    },

    // Before broker stopping
    stopping(): Promise<void> {
      return waitingForActiveContexts(
        runtime.state.trackedContexts,
        runtime.log,
        runtime.options.contextTracking?.shutdownTimeout ?? 0,
      );
    },
    localAction: wrapContextTrackerMiddleware,
    remoteAction: wrapContextTrackerMiddleware,
    localEvent: wrapContextTrackerMiddleware,
  };
};
