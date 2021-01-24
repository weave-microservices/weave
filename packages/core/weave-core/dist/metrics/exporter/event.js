"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportEventMetricExporter = void 0;
function exportEventMetricExporter(options) {
    const lastChanges = new Set();
    let registry;
    const sendEvent = () => {
        const broker = registry.broker;
        const list = registry.list();
        broker.emit(this.options.eventName, list);
    };
    return {
        init(reg) {
            options = Object.assign(options, {
                eventName: '$metrics.changed',
                interval: 5000
            });
            registry = reg;
            if (options.interval > 0) {
                this.timer = setInterval(() => sendEvent(), options.interval);
                this.timer.unref();
            }
        },
        metricChanged(metric) {
            lastChanges.add(metric);
        }
    };
}
exports.exportEventMetricExporter = exportEventMetricExporter;
