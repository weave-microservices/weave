import { Broker } from "./broker.interface";
import { Middleware } from "./middleware.interface";

export interface MiddlewareHandler {
    init(broker: Broker): void, 
    add(middleware: Middleware): void,
    wrapMethod(methodName: string, handler: Function, bindTo?: any): any,
    wrapHandler(methodName: string, handler: Function, definition: any): any,
    callHandlersAsync(methodName: string, args: any, reverse?: Boolean): any,
    callHandlersSync(methodName: string, args: any, reverse?: Boolean): any
  }