// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'BaseMetric... Remove this comment to see the full error message
const BaseMetricType = require('./base');
module.exports = class Histogram extends BaseMetricType {
    constructor(registry, obj) {
        super(registry, obj);
        this.value = 0;
        // create default buckets
        if (obj.buckets) {
            this.buckets = registry.options.defaultBuckets;
        }
        this.buckets = this.buckets.sort((a, b) => a - b);
    }
    observe(value, labels, timestamp) {
        const labelString = this.stringifyLabels(labels);
        const item = this.values.get(labelString);
        if (!value) {
        }
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        this.set(labels, (item ? item.value : 0) + value);
    }
    decrement(labels, value, timestamp) {
        const item = this.get(labels);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        this.set(labels, (item ? item.value : 0) - value);
    }
    generateSnapshot() {
        return Array.from(this.values)
            .map(([labelString, item]) => {
            return {
                value: item.value,
                labels: item.labels
            };
        });
    }
    set(labels, value, timestamp) {
        const labelString = this.stringifyLabels(labels);
        const item = this.values.get(labelString);
        this.value = value;
        if (item) {
            if (item.value !== value) {
                item.labels = labels;
                item.value = value;
            }
        }
        else {
            const item = {
                labels: labels,
                value: value
            };
            this.values.set(labelString, item);
        }
        return item;
    }
};
