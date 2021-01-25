import { WeaveError } from "../errors";
import { Span } from "../shared/interfaces/span.interface";

const hrTime = require('./time');

export function createSpan(tracer, name, options) {
    const span: Span = {
        name,
        id: options.id || tracer.broker.getUUID(),
        traceId: options.traceId || tracer.broker.getUUID(),
        parentId: options.parentId,
        type: options.type,
        sampled: options.sampled || tracer.shouldSample(),
        service: {
            name: options.service.name,
            version: options.service.version,
            fullyQualifiedName: options.service.fullyQualifiedName
        },
        tags: {},
        addTags(tags){
            Object.assign(span.tags, tags);
            return span;
        },
        start(time) {
            span.startTime = time || hrTime();
            tracer.invokeCollectorMethod('startedSpan', [span]);
            return span;
        },
        startChildSpan(name, options){
            const parentOptions = {
                parentId: options.parentId,
                sampled: options.sampled
            };
            return tracer.startSpan(name, Object.assign(parentOptions, options));
        },
        finish(time) {
            span.finishTime = time || hrTime();
            span.duration = span.finishTime - span.startTime;
            tracer.log.debug('Span finished');
            tracer.invokeCollectorMethod('finishedSpan', [span]);
            return span;
        },
        isActive() {
            return span.finishTime !== null
        },
        setError(error){
            span.error = error;
            return span;
        }
    }

    if (options.tags) {
        span.addTags(options.tags);
    }
    return span;
};
