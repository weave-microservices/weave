"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCollector = exports.Event = exports.resolveCollector = void 0;
const utils_1 = require("@weave-js/utils");
const event_1 = __importDefault(require("./event"));
exports.Event = event_1.default;
const base_1 = __importDefault(require("./base"));
exports.BaseCollector = base_1.default;
const collectors = {
    Event: event_1.default,
    BaseCollector: base_1.default
};
const getByName = (name) => {
    const n = Object.keys(collectors).find(collectorName => collectorName.toLowerCase() === name.toLowerCase());
    return collectors[n];
};
function resolveCollector(broker, collector, tracer) {
    let CollectorClass;
    if (typeof collector === 'string') {
        CollectorClass = getByName(collector);
    }
    if (utils_1.isFunction(collector) || typeof collector === 'object') {
        return collector;
    }
    if (!CollectorClass) {
        broker.handleError(new Error('Tracer not found'));
    }
    return new CollectorClass(collector);
}
exports.resolveCollector = resolveCollector;
//# sourceMappingURL=index.js.map