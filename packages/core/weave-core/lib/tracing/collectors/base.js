"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@weave-js/utils");
class BaseCollector {
    constructor(options) {
        this.options = options || {};
    }
    init(tracer) { }
    initBase(tracer) {
        this.tracer = tracer;
        this.broker = tracer.broker;
        this.log = tracer.log;
    }
    startedSpan(span) { }
    finishedSpan(span) { }
    stop() { }
    flattenTags(obj, convertToString = false, path = '') {
        if (!obj)
            return null;
        return Object.keys(obj).reduce((res, k) => {
            const o = obj[k];
            const pp = (path ? path + '.' : '') + k;
            if (utils_1.isObject(o)) {
                Object.assign(res, this.flattenTags(o, convertToString, pp));
            }
            else if (o !== undefined) {
                res[pp] = convertToString ? String(o) : o;
            }
            return res;
        }, {});
    }
    getErrorFields(error) {
        if (!error) {
            return null;
        }
        return error.stack;
    }
}
exports.default = BaseCollector;
//# sourceMappingURL=base.js.map