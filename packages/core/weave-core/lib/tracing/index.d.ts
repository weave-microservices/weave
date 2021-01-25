export declare function createTracer(): {
    init(broker: any, options: any): void;
    stop(): Promise<any[]>;
    shouldSample(span: any): boolean;
    invokeCollectorMethod(method: any, args: any): void;
    startSpan(name: any, options: any): import("../shared/interfaces/span.interface").Span;
};
