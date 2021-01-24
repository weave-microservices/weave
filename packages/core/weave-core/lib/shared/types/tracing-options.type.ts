export type TracingOptions = {
  enabled: Boolean,
  samplingRate: number,
  collectors: Array<TracingCollector>
}