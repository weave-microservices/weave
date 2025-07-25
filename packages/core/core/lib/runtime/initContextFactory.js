/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */
'use strict';

const { createContext } = require('../broker/context');

/**
 * Init context factory.
 * @param {import('../../types').Runtime} runtime - Runtime reference
*/
exports.initContextFactory = (runtime) => {
  Object.defineProperty(runtime, 'contextFactory', {
    value: {
      /**
       * Creates a new context
       * @param {import('../../types').Endpoint} endpoint - Endpoint
       * @param {Record<string, any>} data - Data
       * @param {import('../../types').ActionOptions} opts Options
       * @returns {import('../../types').Context} Context
      */
      create (endpoint, data, opts = {}) {
        const context = createContext(runtime);

        if (endpoint) {
          context.setEndpoint(endpoint);
        }

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
          context.tracing = opts.parentContext.tracing;
          context.level = opts.parentContext.level + 1;
          if (opts.parentContext.span) {
            // context.span = opts.parentContext.span;
            context.parentId = opts.parentContext.span.id;
          } else {
            context.parentId = opts.parentContext.id;
          }
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
