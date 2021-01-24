"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const mergeDefaultOptions = (options) => {
    return Object.assign({
        interval: 5000,
        eventName: '$tracing.trace.spans',
        sendStartSpan: false,
        sendFinishedSpan: true,
        broadcast: false
    }, options);
};
function default_1(options) {
    options = mergeDefaultOptions(options);
    const exporter = new base_1.default(options);
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
}
exports.default = default_1;
;
