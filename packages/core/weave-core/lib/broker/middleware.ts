/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
import { ServiceAction } from '../registry/service'
import { Broker } from './broker'

export type MiddlewareEventDelegate = (event: any, payload: any) => any

export interface Middleware {
  created?: () => any
  started?: (broker: Broker) => any,
  localAction?: (handler: any, action: ServiceAction) => any, // todo: define a type for handler
  remoteAction?: (handler: any, action: ServiceAction) => any,
  localEvent?: (broker: Broker, handler: any, action: ServiceAction) => any,
  emit?: (next: Function) => MiddlewareEventDelegate,
  broadcast?: (next: Function) => MiddlewareEventDelegate,
  broadcastLocal?: (next: Function) => MiddlewareEventDelegate,
  brokerStopped?: () => any
}

export type MiddlewareHandler = {
  init(broker: Broker): void, 
  add(middleware: Middleware): void,
  wrapMethod(methodName: string, handler: Function, bindTo?: any): any,
  wrapHandler(methodName: string, handler: Function, definition: any): any,
  callHandlersAsync(methodName: string, args: any, reverse?: Boolean): any,
  callHandlersSync(methodName: string, args: any, reverse?: Boolean): any
}

export function createMiddlewareHandler (): MiddlewareHandler {
  const list = []

  return {
    init (broker) {
      this.broker = broker
    },
    add (middleware: Middleware) {
      if (!middleware) {
        return
      }

      if (typeof middleware === 'function') {
        middleware = {
          localAction: middleware
        }
      }

      list.push(middleware)
    },
    wrapMethod (methodName, handler, bindTo = this.broker) {
      if (list.length) {
        const middlewareList = list.filter(middleware => !!middleware[methodName])
        if (middlewareList.length) {
          handler = middlewareList.reduce((next, middleware) => middleware[methodName].call(this.broker, next), handler.bind(bindTo))
        }
      }
      return handler
    },
    wrapHandler (methodName, handler, definition) {
      if (list.length) {
        handler = list.reduce((handler, middleware) => {
          if (typeof middleware[methodName] === 'function') {
            return middleware[methodName].call(this.broker, handler, definition)
          } else {
            return handler
          }
        }, handler)
      }
      return handler
    },
    callHandlersAsync (methodName, args, reverse = false) {
      if (list.length) {
        const middlewareList = reverse ? Array.from(list).reverse() : list
        const momentousHandlers = middlewareList
          .filter(middleware => typeof middleware[methodName] === 'function')
          .map(middleware => middleware[methodName])

        if (momentousHandlers.length) {
          momentousHandlers.reduce((p, func) => p.then(() => func.apply(this.broker, args)), Promise.resolve())
        }
      }
    },
    callHandlersSync (methodName, args, reverse = false) {
      if (list.length) {
        const middlewareList = reverse ? Array.from(list).reverse() : list

        middlewareList
          .filter(middleware => typeof middleware[methodName] === 'function')
          .map(middleware => middleware[methodName])
          .forEach(handler => handler.apply(this.broker, args))
      }
    }
  }
}
