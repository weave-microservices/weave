import { ContextMetadata } from "./ContextMetadata";

export type ContextOptions<T> = {
  stream?: ReadableStream | WritableStream,
  timeout?: number,
  retries?: number,
  requestId?: string;
  meta?: ContextMetadata;
  context?: T;
  parentContext?: T;
}
