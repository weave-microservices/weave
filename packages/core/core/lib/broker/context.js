/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
*/
'use strict';

/**
 * @typedef {import('../types').Context} Context
 * @typedef {import('../types').Runtime} Runtime
 * @typedef {import('../types').ContextPromise} ContextPromise
 * @typedef {import('../types').Endpoint} Endpoint
*/

const { uuid, isFunction, isStream, isStreamObjectMode } = require('@weave-js/utils');
const { WeaveMaxCallLevelError, WeaveError } = require('../errors');

/**
 * Create a new context object
 * @param {Runtime} runtime Runtime reference
 * @returns {Context} Context
*/
exports.createContext = (runtime) => {
  const spanStack = [];

  /** @type {Context} */
  const context = {
    id: null,
    nodeId: runtime.nodeId || null,
    parentId: null,
    callerNodeId: null,
    endpoint: null,
    data: {},
    meta: {},
    level: 1,
    tracing: null,
    span: null,
    service: null,
    startHighResolutionTime: null,
    options: {
      stream: undefined,
      timeout: null,
      retries: null
    },
    duration: 0,
    stopTime: 0,
    isCachedResult: false,
    setData (newParams) {
      this.data = newParams || {};
    },
    setStream (stream) {
      if (isStream(stream)) {
        if (isStreamObjectMode(context.options.stream)) {
          this.meta.$isObjectModeStream = true;
        }
        this.stream = stream;
      } else {
        throw new WeaveError('No valid stream.');
      }
    },
    setEndpoint (endpoint) {
      this.nodeId = endpoint.node.id;
      this.endpoint = endpoint;
      this.action = endpoint.action;
      this.service = endpoint.action.service;
    },
    emit (eventName, payload, options = {}) {
      options.parentContext = this;
      return runtime.eventBus.emit(eventName, payload, options);
    },
    broadcast (eventName, payload, options = {}) {
      options.parentContext = this;
      return runtime.eventBus.broadcast(eventName, payload, options);
    },
    call (actionName, params, options = {}) {
      options.parentContext = this;
      if (runtime.options.registry.maxCallLevel > 0 && this.level >= runtime.options.registry.maxCallLevel) {
        return Promise.reject(new WeaveMaxCallLevelError({ nodeId: runtime.nodeId, maxCallLevel: runtime.options.registry.maxCallLevel }));
      }

      /** @type {ContextPromise} */
      const p = runtime.actionInvoker.call(actionName, params, options);

      return p.then(result => {
        if (p.context) {
          this.meta = Object.assign(this.meta, p.context.meta);
        }
        return result;
      });
    },
    startSpan (name, options) {
      options = Object.assign({
        id: this.id,
        traceId: this.requestId,
        parentId: this.parentId,
        type: 'action',
        service: this.service,
        sampled: this.tracing
      }, options);

      let span;

      if (this.span) {
        span = this.span.startChildSpan(name, options);
      } else {
        span = runtime.tracer.startSpan(name, options);
      }
      spanStack.push(span);
      this.span = span;

      return this.span;
    },
    finishSpan (span, time) {
      if (span && !span.isActive()) {
        return;
      }

      span.finish(time);

      const idx = spanStack.findIndex((s) => s === span);

      if (idx !== -1) {
        spanStack.splice(idx, 1);
        this.span = spanStack[spanStack.length - 1];
      } else {
        /* istanbul ignore next */
        this.service.log.warn('This span is not assigned to this context', span);
      }
    },
    /**
     * Copy the current context.
     * @returns {Context} New copied context
    */
    copy () {
      const contextCopy = exports.createContext(runtime);

      contextCopy.nodeId = this.nodeId;
      contextCopy.options = this.options;
      contextCopy.data = this.data;
      contextCopy.meta = this.meta;
      contextCopy.parentId = this.parentId;
      contextCopy.callerNodeId = this.callerNodeId;
      contextCopy.requestId = this.requestId;
      contextCopy.tracing = this.tracing;
      contextCopy.span = this.span;
      contextCopy.level = this.level;
      contextCopy.eventName = this.eventName;
      contextCopy.eventType = this.eventType;
      contextCopy.eventGroups = this.eventGroups;
      contextCopy.isCachedResult = this.isCachedResult;

      return contextCopy;
    }
  };

  // Generate context Id
  if (!context.id) {
    // Use UUID factory from broker options
    if (runtime.options.uuidFactory && isFunction(runtime.options.uuidFactory)) {
      context.id = runtime.options.uuidFactory.call(context, runtime);
    } else {
      context.id = uuid();
    }

    // Pass existing request ID
    if (!context.requestId) {
      context.requestId = context.id;
    }
  }

  return context;
};

