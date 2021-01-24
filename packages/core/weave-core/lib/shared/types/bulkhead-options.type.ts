export type BulkheadOptions = {
  enabled: Boolean,
  concurrentCalls: number,
  maxQueueSize: number
}