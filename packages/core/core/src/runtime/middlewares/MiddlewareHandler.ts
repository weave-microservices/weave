import { Middleware } from "../../broker/Middleware";
import { Runtime } from "../Runtime";

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
  
  public add (middleware: Middleware) {
    if (!middleware) {
      return;
    }

    if (typeof middleware === 'function') {
      middleware = middleware.call(this.#runtime, this.#runtime);
    }

    this.#list.push(middleware);
  }

  public wrapMethod (methodName: string, handler: Function, bindTo: unknown = this.#runtime) {
    if (this.#list.length) {
      const middlewareList = this.#list.filter(middleware => !!middleware[methodName]);
      if (middlewareList.length) {
        handler = middlewareList.reduce((next, middleware) => middleware[methodName].call(runtime, next), handler.bind(bindTo));
      }
    }
    return handler;
  }

  public wrapHandler (methodName: string, handler, definition) {
    if (this.#list.length) {
      handler = this.#list.reduce((handler, middleware) => {
        if (typeof middleware[methodName] === 'function') {
          return middleware[methodName].call(runtime, handler, definition);
        } else {
          return handler;
        }
      }, handler);
    }
    return handler;
  }

  public callHandlersAsync (methodName: string, args, reverse = false) {
    const middlewareList = reverse ? Array.from(this.#list).reverse() : this.#list;
    const momentousHandlers = middlewareList
      .filter(middleware => typeof middleware[methodName] === 'function')
      .map(middleware => middleware[methodName]);

    if (momentousHandlers.length) {
      return momentousHandlers.reduce((p, func) => p.then(() => func.apply(runtime, args)), Promise.resolve());
    }

    return Promise.resolve();
  }

  public callHandlersSync (methodName: string, args, reverse = false) {
    if (this.#list.length) {
      const middlewareList = reverse ? Array.from(this.#list).reverse() : this.#list;

      middlewareList
        .filter(middleware => typeof middleware[methodName] === 'function')
        .map(middleware => middleware[methodName])
        .forEach(handler => handler.apply(this.#runtime, args));
    }
  }
}

export { MiddlewareHandler };