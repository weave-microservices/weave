"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseMetricType = require('./base');
class Gauge extends BaseMetricType {
    constructor(store, obj) {
        super(store, obj);
        this.values = new Map();
        this.value = 0;
    }
    increment(labels, value, timestamp) {
        const item = this.get(labels);
        this.set(labels, (item ? item.value : 0) + value, timestamp);
    }
    decrement(labels, value, timestamp) {
        const item = this.get(labels);
        this.set(labels, (item ? item.value : 0) - value, timestamp);
    }
    generateSnapshot() {
        return Array.from(this.values.keys()).map((key) => {
            const item = this.values.get(key);
            return {
                key,
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
                item.timestamp = timestamp == null ? Date.now() : timestamp;
            }
        }
        else {
            const item = {
                labels: labels,
                value: value,
                timestamp: timestamp == null ? Date.now() : timestamp
            };
            this.values.set(labelString, item);
        }
        return item;
    }
}
exports.default = Gauge;
