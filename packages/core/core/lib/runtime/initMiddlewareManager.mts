import type { ParsedAction, ParsedEvent } from "../../types/internal.js";
import type { Middleware } from "../../types/index.js";
import type { Runtime } from "../../types/index.js";

type MiddlewareFactory = (runtime: Runtime) => Middleware;

export const initMiddlewareHandler = (runtime: Runtime): void => {
  const list: Middleware[] = [];

  Object.defineProperty(runtime, "middlewareHandler", {
    value: {
      count(): number {
        return list.length;
      },
      add(middleware: Middleware | MiddlewareFactory | null | undefined): void {
        if (!middleware) {
          return;
        }

        if (typeof middleware === "function") {
          middleware = middleware.call(runtime, runtime);
        }

        list.push(middleware);
      },
      wrapMethod<T extends (...args: unknown[]) => unknown>(
        methodName: string,
        handler: T,
        bindTo: unknown = runtime,
      ): T {
        if (list.length) {
          const middlewareList = list.filter((middleware) => !!middleware[methodName]);
          if (middlewareList.length) {
            handler = middlewareList.reduce(
              (next, middleware) => middleware[methodName].call(runtime, next),
              handler.bind(bindTo),
            ) as T;
          }
        }
        return handler;
      },
      wrapHandler<T extends (...args: unknown[]) => unknown>(
        methodName: string,
        handler: T,
        definition?: ParsedAction | ParsedEvent,
      ): T {
        if (list.length) {
          handler = list.reduce((handler: T, middleware: Middleware) => {
            if (typeof middleware[methodName] === "function") {
              return middleware[methodName].call(runtime, handler, definition) as T;
            } else {
              return handler;
            }
          }, handler);
        }
        return handler;
      },
      callHandlersAsync(
        methodName: string,
        args: unknown[],
        reverse: boolean = false,
      ): Promise<void> {
        const middlewareList = reverse ? Array.from(list).reverse() : list;
        const momentousHandlers = middlewareList
          .filter((middleware) => typeof middleware[methodName] === "function")
          .map((middleware) => middleware[methodName] as (...args: unknown[]) => unknown);

        if (momentousHandlers.length) {
          return momentousHandlers.reduce(
            (p: Promise<void>, func) => p.then(() => func.apply(runtime, args)) as Promise<void>,
            Promise.resolve(),
          );
        }

        return Promise.resolve();
      },
      callHandlersSync(methodName: string, args: unknown[], reverse: boolean = false): void {
        if (list.length) {
          const middlewareList = reverse ? Array.from(list).reverse() : list;

          middlewareList
            .filter((middleware) => typeof middleware[methodName] === "function")
            .map((middleware) => middleware[methodName] as (...args: unknown[]) => unknown)
            .forEach((handler) => handler.apply(runtime, args));
        }
      },
    },
  });
};
