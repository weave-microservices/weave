import { createContext } from '../broker/context.mts';
import type { ActionOptions, Endpoint, Runtime } from '../../types/index.js';

export const initContextFactory = (runtime: Runtime) => {
  Object.defineProperty(runtime, 'contextFactory', {
    value: {
      create (endpoint: Endpoint, data: Record<string, any>, opts: ActionOptions = {}) {
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
