// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'BaseMetric... Remove this comment to see the full error message
const BaseMetricType = require('./base');
module.exports = class Gauge extends BaseMetricType {
    constructor(store, obj) {
        super(store, obj);
        this.values = new Map();
        this.value = 0;
    }
    increment(labels, value, timestamp) {
        const item = this.get(labels);
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
