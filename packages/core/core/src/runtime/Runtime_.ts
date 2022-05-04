import { EventEmitter2 } from "eventemitter2";
import { Broker } from "../broker/Broker";
import { BrokerConfiguration } from "../broker/BrokerConfiguration";
import { Transport } from "../types";

type ActionInvokerTodo = any;
type Options = any;
type Logger = any;
type EventBus = any;
type ServiceRegistry = any;
type MiddlewareHandler = any;
type Cache = any;
type Validator = any;

export type Runtime = {
  nodeId: string;
  version: string;
  options: BrokerConfiguration;
  state: {
    instanceId: string;
    isStarted: boolean;
    [key: string]: any;
  };
  broker: Broker;
  validator: Validator;
  actionInvoker: ActionInvokerTodo;
  log: Logger;
  bus: EventEmitter2;
  eventBus: EventBus;
  services: ServiceRegistry;
  transport?: Transport;
  cache: Cache;
  tracer?: any;
  middlewareHandler: MiddlewareHandler;
  createLogger: Logger;
  generateUUID: () => string;
  handleError: (error: Error) => void;
  fatalError: (message: string, error: Error, killProcess: boolean) => void;
}