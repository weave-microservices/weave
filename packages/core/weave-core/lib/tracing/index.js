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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTracer = void 0;
const collectors_1 = require("./collectors");
const span_1 = require("./span");
function createTracer() {
    let collectors = [];
    let samplingCounter = 0;
    return {
        init(broker, options) {
            this.options = options;
            this.broker = broker;
            this.log = broker.createLogger('Tracer');
            // this.storage = asyncStore()
            // this.storage.enable()
            if (options.enabled) {
                this.log.info('Tracer initialized.');
                if (options.collectors) {
                    collectors = options.collectors
                        .map(entry => {
                        const collector = collectors_1.resolveCollector(broker, entry, this);
                        collector.init(this);
                        return collector;
                    });
                }
            }
        },
        stop() {
            return __awaiter(this, void 0, void 0, function* () {
                if (collectors) {
                    return yield Promise.all(collectors.map(collector => collector.stop()));
                }
            });
        },
        shouldSample(span) {
            // check span priority
            if (this.options.samplingRate === 0) {
                return false;
            }
            if (this.options.samplingRate === 1) {
                return true;
            }
            if (++samplingCounter * this.options.samplingRate >= 1) {
                samplingCounter = 0;
                return true;
            }
            return false;
        },
        invokeCollectorMethod(method, args) {
            collectors.map(collector => collector[method].apply(collector, args));
        },
        startSpan(name, options) {
            const span = span_1.createSpan(this, name, Object.assign({
                type: 'custom'
            }, options));
            span.start();
            return span;
        }
    };
}
exports.createTracer = createTracer;
//# sourceMappingURL=index.js.map