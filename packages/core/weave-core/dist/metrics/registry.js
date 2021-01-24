"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMetricRegistry = void 0;
const { isPlainObject } = require('@weave-js/utils');
const MetricTypes = require('./types');
function createMetricRegistry(broker, options) {
    return {
        broker,
        options,
        log: broker.createLogger('Metrics'),
        init() {
            this.storage = new Map();
            if (options.adapters) {
                if (!Array.isArray(options.adapters)) {
                    broker.handleError(new Error('Metic adapter needs to be an Array'));
                }
                this.adapters = options.adapters.map(adapter => {
                    adapter.init(this);
                    return adapter;
                });
            }
            this.log.debug('Metrics initialized.');
        },
        register(obj) {
            if (!isPlainObject(obj)) {
                broker.handleError(new Error('Param needs to be an object.'));
            }
            if (!obj.type) {
                broker.handleError(new Error('Type is missing.'));
            }
            if (!obj.name) {
                broker.handleError(new Error('Name is missing.'));
            }
            const MetricType = MetricTypes.resolve(obj.type);
            if (!MetricType) {
                broker.handleError(new Error('Unknown metric type.'));
            }
            const type = new MetricType(this, obj);
            this.storage.set(obj.name, type);
            return type;
        },
        increment(name, labels, value = 1, timestamp) {
            const item = this.storage.get(name);
            if (!item) {
                broker.handleError(new Error('Item not found.'));
            }
            item.increment(labels, value, timestamp);
        },
        decrement(name, labels, value = 1, timestamp) {
            const item = this.storage.get(name);
            if (!item) {
                broker.handleError(new Error('Item not found.'));
            }
            item.decrement(labels, value, timestamp);
        },
        timer(name, labels, timestamp) {
            // const item = this.storage.get(name)
            // if (item) {
            // }
            // item.observe(labels, value, timestamp)
        },
        getMetric(name) {
            const item = this.storage.get(name);
            if (!item) {
                broker.handleError(new Error('Item not found.'));
            }
            return item;
        },
        list() {
            const results = [];
            this.storage.forEach(metric => {
                results.push(metric.toObject());
            });
            return results;
        }
    };
}
exports.createMetricRegistry = createMetricRegistry;
