const hrTime = require('./time');

exports.createSpan = (tracer, name, options) => {
  const span = Object.assign({}, {
    name,
    id: options.id || tracer.runtime.generateUUID(),
    traceId: options.traceId || tracer.runtime.generateUUID(),
    parentId: options.parentId,
    type: options.type,
    sampled: options.sampled || tracer.shouldSample(),
    service: options.service,
    tags: {}
  });

  if (options.service) {
    span.service = {
      name: options.service.name,
      version: options.service.version,
      fullyQualifiedName: options.service.fullyQualifiedName
    };
  }

  span.addTags = (tags) => {
    Object.assign(span.tags, tags);
    return span;
  };

  span.start = (time) => {
    span.startTime = time || hrTime();
    tracer.invokeCollectorMethod('startedSpan', [span]);
    return span;
  };

  span.startChildSpan = (name, options) => {
    const parentOptions = {
      parentId: options.parentId,
      sampled: options.sampled
    };
    return tracer.startSpan(name, Object.assign(parentOptions, options));
  };

  span.finish = (time) => {
    span.finishTime = time || hrTime();
    span.duration = span.finishTime - span.startTime;
    tracer.log.debug(`Span "${span.id}" finished`);
    tracer.invokeCollectorMethod('finishedSpan', [span]);

    return span;
  };

  span.isActive = () => span.finishTime !== null;

  span.setError = (error) => {
    span.error = error;
    return span;
  };

  if (options.tags) {
    span.addTags(options.tags);
  }

  return span;
};
