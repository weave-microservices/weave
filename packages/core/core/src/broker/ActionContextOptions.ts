import { ContextMetadata } from "./ContextMetadata";

export type ActionContextOptions<T> = {
  requestId?: string;
  meta?: ContextMetadata;
  stream?: ReadableStream|WritableStream;
  context?: T;
  parentContext?: T;
  retryCount: number;
}
