const { isPlainObject, isFunction } = require('@weave-js/utils');
const { WeaveError } = require('../errors');
const { registerCommonMetrics, updateCommonMetrics } = require('../metrics/common');
const MetricTypes = require('../metrics/types');

/**
 * Init metrics module
 * @param {import('../../types').Runtime} runtime - Runtime reference
 * @returns {void}
 */
exports.initMetrics = (runtime) => {
  const metricOptions = runtime.options.metrics;

  if (metricOptions?.enabled) {
    const storage = new Map();

    const log = runtime.createLogger('METRICS');

    /** @type {NodeJS.Timeout} */
    let commonUpdateTimer;

    Object.defineProperty(runtime, 'metrics', {
      value: {
        runtime,
        options: metricOptions,
        storage,
        log,
        init () {
          if (metricOptions.adapters) {
            if (!Array.isArray(metricOptions.adapters)) {
              runtime.handleError(new WeaveError('Metic adapter needs to be an Array.'));
            }

            this.adapters = metricOptions.adapters.map(adapter => {
              adapter.init(this);
              return adapter;
            });
          }
        },
        async stop () {
          if (commonUpdateTimer) {
            clearInterval(commonUpdateTimer);
          }

          if (!this.adapters || this.adapters.length === 0) {
            return;
          }

          const results = await Promise.allSettled(this.adapters.map(adapter => adapter.stop()));
          const failures = results.filter(result => result.status === 'rejected');

          if (failures.length > 0) {
            failures.forEach(failure => {
              log.warn(failure.reason, 'Failed to stop metrics adapter');
            });
            log.warn(`Failed to stop ${failures.length} of ${this.adapters.length} metrics adapters`);
          }

          return results;
        },
        register (obj) {
          if (!isPlainObject(obj)) {
            runtime.handleError(new WeaveError('Param needs to be an object.'));
          }

          if (!obj.type) {
            runtime.handleError(new WeaveError('Type is missing.'));
          }

          if (!obj.name) {
            runtime.handleError(new WeaveError('Name is missing.'));
          }

          const createMetricType = MetricTypes.resolve(obj.type);

          if (!createMetricType) {
            runtime.handleError(new WeaveError('Unknown metric type.'));
          }

          const type = createMetricType(this, obj);

          this.storage.set(obj.name, type);

          return type;
        },
        increment (name, labels, value = 1, timestamp) {
          if (!metricOptions.enabled) {
            return null;
          }

          const item = this.storage.get(name);

          if (!item) {
            runtime.handleError(new WeaveError('Item not found.'));
          }

          item.increment(labels, value, timestamp);
        },
        decrement (name, labels, value = 1, timestamp) {
          if (!metricOptions.enabled) {
            return null;
          }

          const item = this.storage.get(name);

          if (!item) {
            runtime.handleError(new WeaveError('Item not found.'));
          }

          item.decrement(labels, value, timestamp);
        },
        set (name, value, labels, timestamp) {
          if (!metricOptions.enabled) {
            return null;
          }

          const item = this.storage.get(name);

          if (!isFunction(item.set)) {
            runtime.handleError(new WeaveError('Invalid metric type'));
          }

          item.set(value, labels, timestamp);
        },
        timer (name, labels, timestamp) {
          let item;
          if (name) {
            item = this.storage.get(name);
          }
          const start = process.hrtime();

          return () => {
            const delta = process.hrtime(start);
            const duration = (delta[0] + delta[1] / 1e9) * 1000;
            if (item) {
              item.set(duration, labels, timestamp);
            }
            return duration;
          };
        },
        getMetric (name) {
          const item = this.storage.get(name);

          if (!item) {
            runtime.handleError(new WeaveError('Item not found.'));
          }

          return item;
        },
        list (/* options = {} */) {
          const results = [];

          this.storage.forEach(metric => {
            results.push(metric.toObject());
          });

          return results;
        }
      }
    });

    if (metricOptions.enabled && metricOptions.collectCommonMetrics) {
      registerCommonMetrics(runtime);
      commonUpdateTimer = setInterval(() => updateCommonMetrics(runtime), metricOptions.collectInterval);
      commonUpdateTimer.unref();
    }
  }
};
