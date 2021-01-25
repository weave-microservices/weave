import { TracingOptions } from "../types/tracing-options.type";
import { Broker } from "./broker.interface";
import { Span } from "./span.interface";
export interface Tracer {
    init(broker: Broker, options: TracingOptions): void;
    stop(): Promise<any>;
    shouldSample(span: Span): boolean;
    invokeCollectorMethod(method: string, args: any): void;
    startSpan(name: string, options: any): Span;
}
