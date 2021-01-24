export type MetricsOptions = {
  enabled: Boolean,
  adapters: Array<MetricExporter>,
  defaultBuckets: Array<number>
}
