// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isObject'.
const { isObject } = require('@weave-js/utils');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'BaseCollec... Remove this comment to see the full error message
class BaseCollector {
    constructor(options) {
        this.options = options || {};
    }
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
            if (isObject(o)) {
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
module.exports = BaseCollector;
