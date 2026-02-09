/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */
import type {
  ActionHandler,
  CircuitBreakerOptions,
  Context,
  Endpoint,
  Logger,
  Middleware,
  Runtime,
  ServiceInjection,
  WeaveAction,
} from "../../../types/index.js";
import {
  CIRCUIT_CLOSED,
  CIRCUIT_HALF_OPENED,
  CIRCUIT_HALF_OPEN_WAITING,
  CIRCUIT_OPENED,
} from "../../constants.mts";
import type { CircuitBreakerEndpointState } from "./types.js";

export default (runtime: Runtime): Middleware => {
  const storage = new Map<string, CircuitBreakerEndpointState>();
  let log: Logger | null = null;
  let circuitBreakerTimer: ReturnType<typeof setInterval> | null = null;

  function createWindowTimer(windowTime: number): void {
    circuitBreakerTimer = setInterval(() => clearEndpointStore(), windowTime);
    circuitBreakerTimer.unref();
  }

  function clearEndpointStore(): void {
    storage.forEach((item, name) => {
      if (item.callCounter === 0) {
        storage.delete(name);
        return;
      }

      item.callCounter = 0;
      item.failureCouter = 0;
    });
  }

  function getEndpointState(endpoint: Endpoint, options: CircuitBreakerOptions): CircuitBreakerEndpointState {
    let item = storage.get(endpoint.name);
    if (!item) {
      item = {
        endpoint,
        options,
        callCounter: 0,
        failureCouter: 0,
        state: CIRCUIT_CLOSED,
        circuitBreakerTimer: null,
      };
      storage.set(endpoint.name, item);
    }

    return item;
  }

  function onSuccess(item: CircuitBreakerEndpointState, options: CircuitBreakerOptions): void {
    item.callCounter++;

    if (item.state === CIRCUIT_HALF_OPENED) {
      closeCircuitBreaker(item);
    } else {
      checkThreshold(item, options);
    }
  }

  function onFailure(item: CircuitBreakerEndpointState, options: CircuitBreakerOptions): void {
    item.callCounter++;
    item.failureCouter++;

    checkThreshold(item, options);
  }

  function checkThreshold(item: CircuitBreakerEndpointState, options: CircuitBreakerOptions): void {
    if (item.failureCouter >= (options.maxFailures ?? 0)) {
      openCircuitBreaker(item);
    }
  }

  function openCircuitBreaker(item: CircuitBreakerEndpointState): void {
    item.state = CIRCUIT_OPENED;
    item.endpoint.state = false;
    item.circuitBreakerTimer = setTimeout(
      () => halfOpenCircuitBreaker(item),
      item.options.halfOpenTimeout,
    );
    item.circuitBreakerTimer.unref();
    log?.debug(`Circuit breaker has been opened for endpoint '${item.endpoint.name}'`);
  }

  function halfOpenCircuitBreaker(item: CircuitBreakerEndpointState): void {
    item.state = CIRCUIT_HALF_OPENED;
    item.endpoint.state = true;

    log?.debug(`Circuit breaker has been half opened for endpoint '${item.endpoint.name}'`);

    if (item.circuitBreakerTimer) {
      clearTimeout(item.circuitBreakerTimer);
      item.circuitBreakerTimer = null;
    }
  }

  function handleHalfOpen(item: CircuitBreakerEndpointState): void {
    item.state = CIRCUIT_HALF_OPEN_WAITING;
    item.endpoint.state = false;
    item.circuitBreakerTimer = setTimeout(
      () => halfOpenCircuitBreaker(item),
      item.options.halfOpenTimeout,
    );
    item.circuitBreakerTimer.unref();
  }

  function closeCircuitBreaker(item: CircuitBreakerEndpointState): void {
    item.failureCouter = 0;
    item.callCounter = 0;
    item.state = CIRCUIT_CLOSED;
    item.endpoint.state = true;

    if (item.circuitBreakerTimer) {
      clearTimeout(item.circuitBreakerTimer);
      item.circuitBreakerTimer = null;
    }

    log?.debug(`Circuit breaker has been closed for endpoint '${item.endpoint.name}'`);
  }

  function wrapCircuitBreakerMiddleware(handler: ActionHandler, action: WeaveAction): ActionHandler {
    const options: CircuitBreakerOptions = Object.assign({}, runtime.options.circuitBreaker, action.circuitBreaker || {});

    if (options.enabled) {
      return function curcuitBreakerMiddleware(context: Context, serviceInjections: ServiceInjection): Promise<unknown> {
        const endpoint = context.endpoint;
        if (!endpoint) {
          return handler(context, serviceInjections);
        }

        const item = getEndpointState(endpoint, options);

        // handle half open states
        if (item.state === CIRCUIT_HALF_OPENED) {
          handleHalfOpen(item);
        }

        return handler(context, serviceInjections)
          .then((result: unknown) => {
            const item = getEndpointState(endpoint, options);
            onSuccess(item, options);

            return result;
          })
          .catch((error: unknown) => {
            const err = error as { nodeId?: string };
            if (item && (!err.nodeId || err.nodeId === context.nodeId)) {
              onFailure(item, options);
            }

            return Promise.reject(error);
          });
      };
    }
    return handler;
  }

  return {
    created(): void {
      log = runtime.createLogger("circuit-breaker");

      if (runtime.options.metrics?.enabled) {
        // todo: add circuit breaker metrics
      }
    },
    started(): void {
      const circuitBreakerOptions = runtime.options.circuitBreaker;
      if (circuitBreakerOptions?.enabled && circuitBreakerOptions.windowTime) {
        createWindowTimer(circuitBreakerOptions.windowTime);
      }
    },
    localAction: wrapCircuitBreakerMiddleware,
    remoteAction: wrapCircuitBreakerMiddleware,
    brokerStopped(): void {
      if (circuitBreakerTimer) {
        clearInterval(circuitBreakerTimer);
      }
    },
  };
};
