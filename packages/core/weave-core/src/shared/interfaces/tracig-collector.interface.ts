import { Span } from "./span.interface";
import { Tracer } from "./tracer.interface";

export interface TracingCollector {
  init(tracer: Tracer): void,
  initBase(tracer: Tracer): void,
  startedSpan(span: Span): void,
  finishedSpan(span: Span): void,
  stop(): Promise<void>,
  flattenTags (obj, convertToString, path): Array<any>,
  getErrorFields (error): string
}
