const BaseAdapter = require('./base');

module.exports = (options) => {
  const lastChanges = new Set();

  const adapter = BaseAdapter(options);

  const sendEvent = () => {
    const broker = adapter.registry.broker;
    const list = adapter.registry.list();

    broker.emit(adapter.options.eventName, list);

    lastChanges.clear();
  };

  adapter.init = (registry) => {
    adapter.options = Object.assign({
      eventName: '$metrics.changed',
      interval: 5000
    }, options);

    adapter.registry = registry;

    if (adapter.options.interval > 0) {
      adapter.timer = setInterval(() => sendEvent(), adapter.options.interval);
      adapter.timer.unref();
    } else {
      adapter.timer = undefined;
    }
  };

  adapter.stop = () => {
    clearInterval(adapter.timer);
    return Promise.resolve();
  };

  adapter.metricChanged = (metric) => {
    lastChanges.add(metric);
  };

  return adapter;
};
