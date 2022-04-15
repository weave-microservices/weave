export type ContextOptions<T> = {
  stream?: ReadableStream | WritableStream,
  timeout?: number,
  retries?: number,
  requestId?: string;
  meta?: object;
  context?: T;
  parentContext?: T;
}
