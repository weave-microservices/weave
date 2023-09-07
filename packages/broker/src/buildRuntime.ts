/**
 * @typedef {import('./types.js').BrokerOptions} BrokerOptions
 * @typedef {import('./types.js').Runtime} Runtime
 * @typedef {import('./types.js').Broker} Broker
*/

import EventEmitter2 from '../node_modules/eventemitter2/eventemitter2';
import { BrokerOptions } from './broker/defaultOptions';

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
const EventEmitter = require('eventemitter2');



export class Runtime {
  public nodeId: string;
  public version: string;
  public options: BrokerOptions;
  public bus: EventEmitter2;
  public state: {
    instanceId: string,
    isStarted: boolean
  };
  public handleError: (error: Error) => void;
  public fatalError: (message: string, error: Error, killProcess: boolean) => void;

  constructor(options: BrokerOptions) {

    this.nodeId = options.nodeId;
    this.version = version;
    this.options = options;
    this.bus = new EventEmitter({
      wildcard: true,
      maxListeners: 1000
    });

    this.state = {
      instanceId: uuid(),
      isStarted: false
    }

    this.handleError = (error) => errorHandler(this, error),
    this.fatalError = (message, error, killProcess) => fatalErrorHandler(this, message, error, killProcess)

    initLogger(this);
    initUUIDFactory(this);
    initMiddlewareHandler(this);
    initRegistry(this);
    initContextFactory(this);
    initEventbus(this);
    initValidator(this);
    initTransport(this);
    initCache(this);
    initActionInvoker(this);
    initServiceManager(this);
    initMetrics(this);
    initTracer(this);
  }
}

// exports.initRuntime = (options: BrokerOptions) => {
//   const bus: EventEmitter2 = new EventEmitter({
//     wildcard: true,
//     maxListeners: 1000
//   });

//   const runtime = {
//     nodeId: options.nodeId,
//     version,
//     options,
//     bus,
//     state: {
//       instanceId: uuid(),
//       isStarted: false
//     },
//     handleError: (error) => errorHandler(runtime, error),
//     fatalError: (message, error, killProcess) => fatalErrorHandler(runtime, message, error, killProcess)
//   };

//   initLogger(runtime);
//   initUUIDFactory(runtime);
//   initMiddlewareHandler(runtime);
//   initRegistry(runtime);
//   initContextFactory(runtime);
//   initEventbus(runtime);
//   initValidator(runtime);
//   initTransport(runtime);
//   initCache(runtime);
//   initActionInvoker(runtime);
//   initServiceManager(runtime);
//   initMetrics(runtime);
//   initTracer(runtime);

//   return runtime;
// };
