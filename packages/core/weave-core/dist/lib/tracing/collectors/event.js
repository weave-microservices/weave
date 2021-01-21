var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'BaseCollec... Remove this comment to see the full error message
const BaseCollector = require('./base');
const mergeDefaultOptions = (options) => {
    return Object.assign({
        interval: 5000,
        eventName: '$tracing.trace.spans',
        sendStartSpan: false,
        sendFinishedSpan: true,
        broadcast: false
    }, options);
};
module.exports = (options) => {
    options = mergeDefaultOptions(options);
    const exporter = new BaseCollector(options);
    const queue = [];
    let timer;
    const generateTracingData = () => {
        return Array
            .from(queue)
            .map(span => {
            const newSpan = Object.assign({}, span);
            if (newSpan.error) {
                newSpan.error = exporter.getErrorFields(newSpan.error);
            }
            return newSpan;
        });
    };
    const flushQueue = () => {
        if (queue.length === 0)
            return;
        const data = generateTracingData();
        queue.length = 0;
        if (options.broadcast) {
            exporter.broker.broadcast(options.eventName, data);
        }
        else {
            exporter.broker.emit(options.eventName, data);
        }
    };
    exporter.init = (tracer) => {
        exporter.initBase(tracer);
        if (options.interval > 0) {
            timer = setInterval(() => flushQueue(), options.interval);
            timer.unref();
        }
    };
    exporter.startedSpan = (span) => {
        if (options.sendStartSpan) {
            queue.push(span);
            if (!timer) {
                flushQueue();
            }
        }
    };
    exporter.finishedSpan = (span) => {
        if (options.sendFinishedSpan) {
            queue.push(span);
            if (!timer) {
                flushQueue();
            }
        }
    };
    exporter.stop = () => __awaiter(this, void 0, void 0, function* () {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    });
    return exporter;
};
