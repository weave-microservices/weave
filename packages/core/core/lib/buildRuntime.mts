import { initLogger } from "./runtime/initLogger.mts";
import { initMiddlewareHandler } from "./runtime/initMiddlewareManager.mts";
import { initRegistry } from "./runtime/initRegistry.mts";
import { initContextFactory } from "./runtime/initContextFactory.mts";
import { initEventbus } from "./runtime/initEventbus.mts";
import { initValidator } from "./runtime/initValidator.mts";
import { initTransport } from "./runtime/initTransport.mts";
import { initCache } from "./runtime/initCache.mts";
import { initActionInvoker } from "./runtime/initActionInvoker.mts";
import { initServiceManager } from "./runtime/initServiceManager.mts";
import { initMetrics } from "./runtime/initMetrics.mts";
import { initTracer } from "./runtime/initTracing.mts";
import { initUUIDFactory } from "./runtime/initUuidFactory.mts";
import { errorHandler, fatalErrorHandler } from "./errorHandler.mts";
import { uuid } from "@weave-js/utils";
import packageJson from "../package.json" with { type: "json" };
import pkg from "eventemitter2";
import type { BrokerOptions, Runtime } from '../types/index.js';
const { EventEmitter2: EventEmitter } = pkg;
const { version } = packageJson;

export const initRuntime = (options: BrokerOptions) => {
  const bus = new EventEmitter({
    wildcard: true,
    maxListeners: 1000,
  });

  const runtime: Partial<Runtime> = {
    nodeId: options.nodeId,
    version,
    options,
    bus,
    state: {
      instanceId: uuid(),
      isStarted: false,
    },
    handleError: (error: Error) => errorHandler(runtime, error),
    fatalError: (message: string, error: Error, killProcess: boolean) =>
      fatalErrorHandler(runtime, message, error, killProcess),
  };

  initLogger(runtime);
  initUUIDFactory(runtime);
  initMiddlewareHandler(runtime);
  initRegistry(runtime);
  initContextFactory(runtime);
  initEventbus(runtime);
  initValidator(runtime);
  initTransport(runtime);
  initCache(runtime);
  initActionInvoker(runtime);
  initServiceManager(runtime);
  initMetrics(runtime);
  initTracer(runtime);

  return runtime;
};
