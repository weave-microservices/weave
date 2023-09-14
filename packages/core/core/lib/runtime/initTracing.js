const { resolveCollector } = require('../tracing/collectors');
const { createSpan } = require('../tracing/span');

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
      startSpan (name, options) {
        const parentOptions = {};
        if (options.parentSpan) {
          parentOptions.traceId = options.parentSpan.traceId;
          parentOptions.parentId = options.parentSpan.id;
          parentOptions.sampled = options.parentSpan.sampled;
        }
        const span = createSpan(this, name, Object.assign({
          type: 'custom'
        }, options));

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
