import { EventEmitter2 } from "eventemitter2";
import { Broker } from "../broker/Broker";
import { BrokerConfiguration } from "../broker/BrokerConfiguration";
import { createLogger } from "../logger";
import { Logger } from "../logger/Logger";
import { LoggerOptions } from "../logger/LoggerOptions";
import { Registry } from "../registry/Registry";
import { MiddlewareHandler } from "./middlewares/MiddlewareHandler";

const { isFunction, uuid } = require('@weave-js/utils');
const { version } = require('../package.json');

export type Registry = any;
type ActionInvokerTodo = any;
type Options = any;
type Logger = any;
type EventBus = any;
type ServiceRegistry = any;
type MiddlewareHandler = any;
type Cache = any;
type Validator = any;

class Runtime {
  public bus: EventEmitter2;
  public nodeId: string;
  public version: string;
  public options: BrokerConfiguration;
  public state: {
    instanceId: string;
    isStarted: boolean;
  } & Record<string, any>;
  public log: Logger;
  public registry: Registry;
  public broker?: Broker
  public middlewareHandler: MiddlewareHandler;

  constructor (options: BrokerConfiguration) {
    this.options = options
    this.nodeId = options.nodeId;
    this.version = version;
    this.bus = new EventEmitter2({
      wildcard: true,
      maxListeners: 1000
    });

    this.state = {
      instanceId: uuid(),
      isStarted: false
    };

    this.log = this.createLogger('WEAVE');
    this.middlewareHandler = new MiddlewareHandler(this)
    this.registry = new Registry(this);
  }

  public generateUUID () {
    const factoryIsFunction: boolean = isFunction(this.options.uuidFactory)
    return (
      this.options.uuidFactory &&
      factoryIsFunction
    ) ? () => this.options.uuidFactory!(this) : uuid;
  }

  public createLogger (moduleName: string, additional: Record<string, any> = {}): Logger {
    const bindings = {
      nodeId: this.options.nodeId,
      moduleName,
      ...additional
    };

    // merge log options
    const loggerOptions: LoggerOptions = defaultsDeep({
      base: {
        ...bindings
      }
    }, this.options.logger);

    return createLogger(loggerOptions);
  }

  public handleError (error: Error): void {
    if (this.options.errorHandler) {
      return this.options.errorHandler.call(null, error);
    }
    throw error;
  }

  public fatalError (message: string, error: Error, killProcess: boolean): void {
    if (this.options.logger?.enabled) {
      this.log.fatal(error, message);
    } else {
      console.error(message, error);
    }
  
    if (killProcess) {
      process.exit(1);
    }
  }
}

export { Runtime };

// exports.initRuntime = (options: BrokerConfiguration) => {
//   const bus: EventEmitter2 = new EventEmitter2({
//     wildcard: true,
//     maxListeners: 1000
//   });

//   // Create base runtime object
//   const runtime: Partial<Runtime> = {
//     nodeId: options.nodeId,
//     version,
//     options,
//     bus,
//     state: {
//       instanceId: uuid(),
//       isStarted: false
//     },
//     handleError: (error: Error) => errorHandler(runtime, error),
//     fatalError: (message: string, error: Error, killProcess: boolean) => fatalErrorHandler(runtime, message, error, killProcess)
//   };

//   // Init modules
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
