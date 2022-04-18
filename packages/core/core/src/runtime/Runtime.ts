import { Transport } from "../types";

type ActionInvokerTodo = any;
type Options = any;
type Logger = any;
type EventBus = any;
type ServiceRegistry = any;
type MiddlewareHandler = any;

export interface Runtime {
  nodeId: string;
  version: string,
  options: Options,
  actionInvoker: ActionInvokerTodo,
  log: Logger,
  eventBus: EventBus,
  services: ServiceRegistry,
  transport?: Transport,
  tracer?: any,
  middlewareHandler: MiddlewareHandler,
  createLogger: Logger,
  generateUUID: ()
  handleError: (error: Error) => void,
  fatalError: (message: string, error: Error, killProcess: boolean) => void,
}