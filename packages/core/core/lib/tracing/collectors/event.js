const { createBaseTracingCollector } = require('./base');

const mergeDefaultOptions = (options) => {
  return Object.assign({
    interval: 5000,
    eventName: '$tracing.trace.spans',
    sendStartSpan: false,
    sendFinishedSpan: true,
    broadcast: false
  }, options);
};

module.exports = (options) => (runtime, tracer) => {
  options = mergeDefaultOptions(options);

  const exporter = createBaseTracingCollector(runtime);

  exporter.init(runtime, tracer);

  const queue = [];

  let timer;

  const generateTracingData = () => {
    return Array
      .from(queue)
      .map(span => {
        const newSpan = Object.assign({}, span);

        if (newSpan.error) {
          newSpan.error = exporter.getErrorFields(newSpan.error, exporter.options.errors.fields);
        }

        return newSpan;
      });
  };

  const flushQueue = () => {
    if (queue.length === 0) {
      return;
    };

    const data = generateTracingData();
    queue.length = 0;

    if (options.broadcast) {
      exporter.runtime.eventBus.broadcast(options.eventName, data);
    } else {
      exporter.runtime.eventBus.emit(options.eventName, data);
    }
  };

  if (options.interval > 0) {
    timer = setInterval(() => flushQueue(), options.interval);
    timer.unref();
  }

  exporter.init = (runtime) => {

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

  exporter.stop = async () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  return exporter;
};
