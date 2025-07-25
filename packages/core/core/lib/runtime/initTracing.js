const { resolveCollector } = require('../tracing/collectors');
const { Span } = require('../tracing/span');

/**
 * Init tracer
 * @param {import('../../types').Runtime} runtime Runtime
 */
exports.initTracer = (runtime) => {
  const options = runtime.options.tracing;
  const log = runtime.createLogger('TRACER');

  let collectors = [];
  let samplingCounter = 0;

  Object.defineProperty(runtime, 'tracer', {
    value: {
      runtime,
      options,
      log,
      async stop () {
        if (collectors.length > 0) {
          return await Promise.all(collectors.map(collector => collector.stop()));
        }
      },
      shouldSample (span) {
        if (options.samplingRate === 0) {
          return false;
        }

        if (options.samplingRate === 1) {
          return true;
        }

        if (++samplingCounter * this.options.samplingRate >= 1) {
          samplingCounter = 0;
          return true;
        }

        return false;
      },
      invokeCollectorMethod (method, args) {
        collectors.map(collector => collector[method].apply(collector, args));
      },
      startSpan (name, spanOptions = {}) {
        const parentOptions = {};

        if (spanOptions.parentSpan) {
          parentOptions.traceId = spanOptions.parentSpan.traceId;
          parentOptions.parentId = spanOptions.parentSpan.id;
          parentOptions.sampled = spanOptions.parentSpan.sampled;
        }

        const span = new Span(
          this,
          name,
          Object.assign(
            {
              type: 'custom',
              defaultTags: options.defaultTags
            },
            parentOptions,
            spanOptions,
            {
              parentSpan: undefined
            }
          )
        );

        span.start();

        return span;
      }
    }
  });

  if (options.enabled) {
    log.info('Tracer initialized.');

    if (options.collectors) {
      collectors = options.collectors
        .map(entry => {
          const initCollector = resolveCollector(runtime, entry, this);
          initCollector.init(runtime);
          return initCollector;
        });
    }
  }
};
