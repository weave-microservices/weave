/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
*/
'use strict';

import { Service } from "../types";
import { ContextOptions } from "./ContextOptions";
import { BaseContext, Context, SpanOptions } from "./Context";
import { ActionMetadata } from "./ContextMetadata";
import { ActionContext } from "./ActionContext";

const { uuid, isFunction, isStream, isStreamObjectMode } = require('@weave-js/utils');
const { WeaveMaxCallLevelError, WeaveError } = require('../errors');

type Runtime = any
type Endpoint = any
type Tracing = any
type Service = any
type Span = any
type Action = any
// todo: move to ActionContext
type ActionPromise = Promise<unknown>  &{
  context: ActionContext;
} 

class EventContext extends BaseContext<EventContext> {
  // privates
  #runtime: Runtime;

  // publics
  tracing?: Tracing;
  service?: Service;
  action?: Action;
  span: Span;
  eventName?: string;
  eventType?: string;
  eventGroups?: string[];


  /**
   * Create a new context object
  */
  constructor(runtime: Runtime) {
    super(runtime);
    this.#runtime = runtime;
  }

  setEndpoint (endpoint: Endpoint) {
    this.nodeId = endpoint.node.id;
    this.endpoint = endpoint;
    this.action = endpoint.action;
    this.service = endpoint.action.service;
  }

  /**
   * Copy the context object
   * @returns {Context}
   */
  copy () {
    const contextCopy = new EventContext(this.#runtime);

    contextCopy.nodeId = this.nodeId;
    contextCopy.options = this.options;
    contextCopy.data = this.data;
    contextCopy.meta = this.meta;
    contextCopy.parentContext = this.parentContext;
    contextCopy.callerNodeId = this.callerNodeId;
    contextCopy.requestId = this.requestId;
    contextCopy.tracing = this.tracing;
    contextCopy.level = this.level;
    contextCopy.eventName = this.eventName;
    contextCopy.eventType = this.eventType;
    contextCopy.eventGroups = this.eventGroups;

    return contextCopy;
  }

  startSpan (spanName: string, spanOptions: SpanOptions) {
    spanOptions = Object.assign({
      id: this.id,
      traceId: this.requestId,
      parentId: this.parentId,
      type: 'action',
      service: this.service,
      sampled: this.tracing
    }, spanOptions);

    if (this.span) {
      this.span = this.span.startChildSpan(spanName, spanOptions);
    } else {
      this.span = this.#runtime.tracer.startSpan(spanName, spanOptions);
    }
    return this.span;
  }

  finishSpan () {
    if (this.span) {
      this.span.finish();
      return this.span;
    }
  }
}

export { EventContext };


// /**
//  * Create a new context object
//  * @param {Runtime} runtime Runtime reference
//  * @returns {Context} Context
// */
// exports.createContext = (runtime) => {
//   /** @type {Context} */
//   const context = {
//     id: null,
//     nodeId: runtime.nodeId || null,
//     callerNodeId: null,
//     parentContext: null,
//     endpoint: null,
//     data: {},
//     meta: {},
//     level: 1,
//     tracing: null,
//     span: null,
//     service: null,
//     startHighResolutionTime: null,
//     options: {
//       stream: undefined,
//       timeout: null,
//       retries: null
//     },
//     duration: 0,
//     stopTime: 0,
//     setData (newParams) {
//       this.data = newParams || {};
//     },
//     setStream (stream) {
//       if (isStream(stream)) {
//         if (isStreamObjectMode(context.options.stream)) {
//           this.meta.$isObjectModeStream = true;
//         }
//         this.stream = stream;
//       } else {
//         throw new WeaveError('No valid stream.');
//       }
//     },
//     setEndpoint (endpoint) {
//       this.nodeId = endpoint.node.id;
//       this.endpoint = endpoint;
//       this.action = endpoint.action;
//       this.service = endpoint.action.service;
//     },
//     emit (eventName, payload, options = {}) {
//       options.parentContext = this;
//       return runtime.eventBus.emit(eventName, payload, options);
//     },
//     broadcast (eventName, payload, options = {}) {
//       options.parentContext = this;
//       return runtime.eventBus.broadcast(eventName, payload, options);
//     },
//     call (actionName, params, options = {}) {
//       options.parentContext = this;
//       if (runtime.options.registry.maxCallLevel > 0 && this.level >= runtime.options.registry.maxCallLevel) {
//         return Promise.reject(new WeaveMaxCallLevelError({ nodeId: runtime.nodeId, maxCallLevel: runtime.options.registry.maxCallLevel }));
//       }

//       /** @type {ContextPromise} */
//       const p = runtime.actionInvoker.call(actionName, params, options);

//       return p.then(result => {
//         if (p.context) {
//           this.meta = Object.assign(this.meta, p.context.meta);
//         }
//         return result;
//       });
//     },
//     startSpan (name, options) {
//       options = Object.assign({
//         id: this.id,
//         traceId: this.requestId,
//         parentId: this.parentId,
//         type: 'action',
//         service: this.service,
//         sampled: this.tracing
//       }, options);

//       if (this.span) {
//         this.span = this.span.startChildSpan(name, options);
//       } else {
//         this.span = runtime.tracer.startSpan(name, options);
//       }
//       return this.span;
//     },
//     finishSpan () {
//       if (this.span) {
//         this.span.finish();
//         return this.span;
//       }
//     },
//     /**
//      * Copy the current context.
//      * @returns {Context} New copied context
//     */
//     copy () {
//       const contextCopy = exports.createContext(runtime);

//       contextCopy.nodeId = this.nodeId;
//       contextCopy.options = this.options;
//       contextCopy.data = this.data;
//       contextCopy.meta = this.meta;
//       contextCopy.parentContext = this.parentContext;
//       contextCopy.callerNodeId = this.callerNodeId;
//       contextCopy.requestId = this.requestId;
//       contextCopy.tracing = this.tracing;
//       contextCopy.level = this.level;
//       contextCopy.eventName = this.eventName;
//       contextCopy.eventType = this.eventType;
//       contextCopy.eventGroups = this.eventGroups;

//       return contextCopy;
//     }
//   };

//   // Generate context Id
//   if (!context.id) {
//     // Use UUID factory from broker options
//     if (runtime.options.uuidFactory && isFunction(runtime.options.uuidFactory)) {
//       context.id = runtime.options.uuidFactory.call(context, runtime);
//     } else {
//       context.id = uuid();
//     }

//     // Pass existing request ID
//     if (!context.requestId) {
//       context.requestId = context.id;
//     }
//   }

//   return context;
// };

