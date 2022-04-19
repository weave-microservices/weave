import { EventEmitter2 } from "eventemitter2";
import { Transport } from "../types";

type ActionInvokerTodo = any;
type Options = any;
type Logger = any;
type EventBus = any;
type ServiceRegistry = any;
type MiddlewareHandler = any;

export type Runtime = {
  nodeId: string;
  version: string;
  options: Options;
  state: {
    instanceId: string;
    isStarted: boolean;
    [key: string]: any;
  };
  actionInvoker: ActionInvokerTodo;
  log: Logger;
  bus: EventEmitter2;
  eventBus: EventBus;
  services: ServiceRegistry;
  transport?: Transport;
  tracer?: any;
  middlewareHandler: MiddlewareHandler;
  createLogger: Logger;
  generateUUID: () => string;
  handleError: (error: Error) => void;
  fatalError: (message: string, error: Error, killProcess: boolean) => void;
}