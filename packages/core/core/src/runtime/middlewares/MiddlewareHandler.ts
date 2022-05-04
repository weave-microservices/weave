import { Middleware } from "../../broker/Middleware";
import { Runtime } from "../Runtime";
import { MiddlewareMethod } from "./MiddlewareMethod";

class MiddlewareHandler {
  #runtime: Runtime;
  #list: Array<Middleware>;

  constructor (runtime: Runtime) {
    this.#runtime = runtime
    this.#list = []
  }

  public count () {
    return this.#list.length;
  }
  
  public add (middleware: Middleware | Function) {
    if (!middleware) {
      return;
    }

    if (typeof middleware === 'function') {
      middleware = middleware.call(this.#runtime, this.#runtime) as Middleware;
    }

    this.#list.push(middleware);
  }

  public wrapMethod (methodName: string, handler: Function, bindTo: unknown = this.#runtime) {
    if (this.#list.length) {
      const middlewareList = this.#list.filter(middleware => !!middleware[methodName as keyof typeof middleware]);
      if (middlewareList.length) {
        handler = middlewareList.reduce((next, middleware) => middleware[methodName as keyof typeof middleware].call(runtime, next), handler.bind(bindTo));
      }
    }
    return handler;
  }

  public wrapHandler (methodName: string, handler: Function, definition: object) {
    if (this.#list.length) {
      handler = this.#list.reduce((handler, middleware) => {
        if (typeof middleware[methodName as keyof typeof middleware] === 'function') {
          return middleware[methodName as keyof typeof middleware].call(runtime, handler, definition) as Function;
        } else {
          return handler;
        }
      }, handler);
    }
    return handler;
  }

  public callHandlersAsync (methodName: string, args: Array<any>, reverse: boolean = false): Promise<any> {
    const middlewareList: Array<Middleware> = reverse ? Array.from(this.#list).reverse() : this.#list;
    const momentousHandlers = middlewareList
      .filter(middleware => typeof middleware[methodName as keyof typeof middleware] === 'function')
      .map(middleware => middleware[methodName as keyof typeof middleware]);

    if (momentousHandlers.length) {
      return momentousHandlers.reduce((p, func) => {
        return p.then(() => func.apply(this.#runtime, args)) as Promise<any>
      }, Promise.resolve());
    }

    return Promise.resolve();
  }

  public callHandlersSync (methodName: string, args: Array<any>, reverse = false) {
    if (this.#list.length) {
      const middlewareList = reverse ? Array.from(this.#list).reverse() : this.#list;

      middlewareList
        .filter(middleware => typeof middleware[methodName as keyof typeof middleware] === 'function')
        .map(middleware => middleware[methodName as keyof typeof middleware])
        .forEach(handler => handler.apply(this.#runtime, args));
    }
  }
}

export { MiddlewareHandler };