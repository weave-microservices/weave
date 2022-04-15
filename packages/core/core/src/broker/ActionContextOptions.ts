export type ActionContextOptions<T> = {
  requestId?: string;
  meta?: object;
  context?: T;
  parentContext?: T;
}
