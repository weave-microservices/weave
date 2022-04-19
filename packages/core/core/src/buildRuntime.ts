/**
 * @typedef {import('./types.js').BrokerOptions} BrokerOptions
 * @typedef {import('./types.js').Runtime} Runtime
 * @typedef {import('./types.js').Broker} Broker
*/

import { EventEmitter2 } from "eventemitter2";
import { BrokerConfiguration } from "./broker/Options";
import { Runtime } from "./runtime/Runtime";

const { initLogger } = require('./runtime/initLogger');
const { initMiddlewareHandler } = require('./runtime/initMiddlewareManager');
const { initRegistry } = require('./runtime/initRegistry');
const { initContextFactory } = require('./runtime/initContextFactory');
const { initEventbus } = require('./runtime/initEventbus');
const { initValidator } = require('./runtime/initValidator');
const { initTransport } = require('./runtime/initTransport');
const { initCache } = require('./runtime/initCache');
const { initActionInvoker } = require('./runtime/initActionInvoker');
const { initServiceManager } = require('./runtime/initServiceManager');
const { initMetrics } = require('./runtime/initMetrics');
const { initTracer } = require('./runtime/initTracing');
const { initUUIDFactory } = require('./runtime/initUuidFactory');
const { errorHandler, fatalErrorHandler } = require('./errorHandler');
const { uuid } = require('@weave-js/utils');
const { version } = require('../package.json');

/**
 * Build runtime object
 * @param {BrokerOptions} options Broker options
 * @return {Runtime} Runtime
*/
exports.initRuntime = (options: BrokerConfiguration) => {
  const bus: EventEmitter2 = new EventEmitter2({
    wildcard: true,
    maxListeners: 1000
  });

  // Create base runtime object
  const runtime: Partial<Runtime> = {
    nodeId: options.nodeId,
    version,
    options,
    bus,
    state: {
      instanceId: uuid(),
      isStarted: false
    },
    handleError: (error: Error) => errorHandler(runtime, error),
    fatalError: (message: string, error: Error, killProcess: boolean) => fatalErrorHandler(runtime, message, error, killProcess)
  };

  // Init modules
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
