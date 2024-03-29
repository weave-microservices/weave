const { isFunction } = require('@weave-js/utils');

const collectors = {
  Event: require('./event'),
  BaseCollector: require('./base')
};

const getByName = name => {
  const n = Object.keys(collectors).find(collectorName => collectorName.toLowerCase() === name.toLowerCase());
  return collectors[n];
};

exports.resolveCollector = (runtime, collector) => {
  let CollectorClass;
  if (typeof collector === 'string') {
    CollectorClass = getByName(collector);
  }

  if (isFunction(collector)) {
    return collector(runtime);
  }

  if (typeof collector === 'object') {
    return collector;
  }

  if (!CollectorClass) {
    runtime.handleError(new Error('Tracer not found'));
  }

  return new CollectorClass(collector);
};

exports.Base = collectors.BaseCollector;

exports.Console = collectors.Console;

exports.Event = collectors.Event;
