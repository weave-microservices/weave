const hrTime = require('./time');
exports.createSpan = (tracer, name, options) => {
    const span = Object.assign({}, {
        name,
        id: options.id || tracer.broker.getUUID(),
        traceId: options.traceId || tracer.broker.getUUID(),
        parentId: options.parentId,
        type: options.type,
        sampled: options.sampled || tracer.shouldSample(),
        service: options.service,
        tags: {}
    });
    span.service = {
        name: options.service.name,
        version: options.service.version,
        fullyQualifiedName: options.service.fullyQualifiedName
    };
    (span as any).addTags = (tags) => {
        Object.assign(span.tags, tags);
        return span;
    };
    (span as any).start = (time) => {
        (span as any).startTime = time || hrTime();
        tracer.invokeCollectorMethod('startedSpan', [span]);
        return span;
    };
    (span as any).startChildSpan = (name, options) => {
        const parentOptions = {
            parentId: options.parentId,
            sampled: options.sampled
        };
        return tracer.startSpan(name, Object.assign(parentOptions, options));
    };
    (span as any).finish = (time) => {
        (span as any).finishTime = time || hrTime();
        (span as any).duration = (span as any).finishTime - (span as any).startTime;
        tracer.log.debug('Span finished');
        tracer.invokeCollectorMethod('finishedSpan', [span]);
        return span;
    };
    (span as any).isActive = () => (span as any).finishTime !== null;
    (span as any).setError = (error) => {
        (span as any).error = error;
        return span;
    };
    if (options.tags) {
        (span as any).addTags(options.tags);
    }
    return span;
};
