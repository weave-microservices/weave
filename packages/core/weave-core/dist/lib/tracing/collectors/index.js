// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isFunction... Remove this comment to see the full error message
const { isFunction } = require('@weave-js/utils');
const collectors = {
    Console: require('./console'),
    Event: require('./event'),
    BaseCollector: require('./base')
};
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getByName'... Remove this comment to see the full error message
const getByName = name => {
    const n = Object.keys(collectors).find(collectorName => collectorName.toLowerCase() === name.toLowerCase());
    return collectors[n];
};
exports.resolveCollector = (broker, collector, tracer) => {
    let CollectorClass;
    if (typeof collector === 'string') {
        CollectorClass = getByName(collector);
    }
    if (isFunction(collector) || typeof collector === 'object') {
        return collector;
    }
    if (!CollectorClass) {
        broker.handleError(new Error('Tracer not found'));
    }
    return new CollectorClass(collector);
};
exports.Base = collectors.BaseCollector;
exports.Console = collectors.Console;
exports.Event = collectors.Event;
