"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
class Gauge extends base_1.default {
    constructor(store, obj) {
        super(store, obj);
        this.values = new Map();
        this.value = 0;
    }
    generateSnapshot() {
        return Array.from(this.values)
            .map(([labelString, item]) => {
            return {
                value: item.value,
                labels: item.labels,
                labelString
            };
        });
    }
    set(value, labels, timestamp) {
        const labelString = this.stringifyLabels(labels);
        const item = this.values.get(labelString);
        this.value = value;
        if (item) {
            if (item.value !== value) {
                item.labels = labels;
                item.value = value;
                item.timestamp = timestamp || Date.now();
            }
        }
        else {
            const item = {
                labels: labels,
                value: value,
                timestamp: timestamp || Date.now()
            };
            this.values.set(labelString, item);
        }
        return item;
    }
}
exports.default = Gauge;
//# sourceMappingURL=info.js.map