import { ContextOptions } from "./ContextOptions";

type Endpoint = any; // todo!!!
export type SpanOptions = any; // todo!!!
export type Span = any; // todo!!!

export interface Context<T> {
  setData: (data: unknown) => void;
  copy: () => T;
  setEndpoint: (endpoint: Endpoint) => void;
  setStream: (stream: ReadableStream|WritableStream) => void;
  emit: (eventName: string, payload: unknown, options?: ContextOptions<T>) => Promise<unknown>;
  broadcast: (eventName: string, payload: unknown, options?: ContextOptions<T>) => Promise<unknown>;
  call: (actionName: string, data: unknown, options?: ContextOptions<T>) => Promise<unknown>;
  startSpan: (name: string, options?: SpanOptions) => Span;
  finishSpan: (span: Span) => void;

}