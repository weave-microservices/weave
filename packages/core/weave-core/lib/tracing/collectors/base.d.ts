export default class BaseCollector {
    broker: any;
    log: any;
    options: any;
    tracer: any;
    constructor(options: any);
    init(tracer: any): void;
    initBase(tracer: any): void;
    startedSpan(span: any): void;
    finishedSpan(span: any): void;
    stop(): void;
    flattenTags(obj: any, convertToString?: boolean, path?: string): {};
    getErrorFields(error: any): any;
}
