/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */
'use strict';

const { createContext } = require('../broker/context');

/**
 * @typedef {import('../types').Runtime} Runtime
 * @typedef {import('../types').Context} Context
 * @typedef {import('../types').Endpoint} Endpoint
 * @typedef {import('../types').ActionOptions} ActionOptions
*/

/**
 * Init context factory.
 * @param {Runtime} runtime - Runtime reference
 * @returns {void}
*/
exports.initContextFactory = (runtime) => {
  Object.defineProperty(runtime, 'contextFactory', {
    value: {
      /**
       * Creates a new context
       * @param {Endpoint} endpoint - Endpoint
       * @param {any} data - Data
       * @param {ActionOptions} opts Options
       * @returns {Context} Context
      */
      create (endpoint, data, opts) {
        const context = createContext(runtime);

        if (endpoint) {
          context.setEndpoint(endpoint);
        }

        opts = opts || {};
        context.setData(data);
        // context.timeout = opts.timeout || 0
        context.retryCount = opts.retryCount;
        context.options = opts;

        if (opts.requestId) {
          context.requestId = opts.requestId;
        } else if (opts.parentContext && opts.parentContext.requestId) {
          context.requestId = opts.parentContext.requestId;
        }

        if (opts.parentContext && opts.parentContext.meta !== null) {
          context.meta = Object.assign({}, opts.parentContext.meta, opts.meta);
        } else if (opts.meta) {
          context.meta = opts.meta;
        }

        if (opts.parentContext != null) {
          context.parentId = opts.parentContext.id;
          context.level = opts.parentContext.level + 1;
          context.tracing = opts.parentContext.tracing;
          context.span = opts.parentContext.span;
        }

        if (opts.stream) {
          context.setStream(opts.stream);
        }

        if (context.metrics || context.nodeId !== runtime.nodeId) {
          if (!context.requestId) {
            context.requestId = context.id;
          }
        }

        if (opts.parentSpan) {
          context.tracing = opts.parentSpan.sampled;
        }
        return context;
      }
    }
  });
};
