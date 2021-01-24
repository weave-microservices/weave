"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseMetricType {
    constructor(registry, obj) {
        this.registry = registry;
        this.name = obj.name;
        this.description = obj.description;
        this.values = new Map();
        this.labels = obj.labels || [];
        this.type = obj.type;
    }
    stringifyLabels(labels) {
        if (this.labels.length === 0 || labels === null || typeof labels !== 'object') {
            return '';
        }
        const parts = [];
        this.labels.forEach(labelName => {
            const value = labels[labelName];
            if (typeof value === 'number') {
                parts.push(value);
            }
            else if (typeof value === 'string') {
                parts.push(value);
            }
            else if (typeof value === 'boolean') {
                parts.push('' + value);
            }
            else {
                parts.push('');
            }
        });
        return parts.join('|');
    }
    get(labels) {
        const labelString = this.stringifyLabels(labels);
        return this.values.get(labelString);
    }
    generateSnapshot() { }
    snapshot() {
        return this.generateSnapshot();
    }
    toObject() {
        return {
            type: this.type,
            name: this.name,
            description: this.description,
            value: this.snapshot()
        };
    }
}
exports.default = BaseMetricType;
