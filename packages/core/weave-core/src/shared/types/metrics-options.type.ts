import { MetricExporter } from "../interfaces/metric-exporter.interface";

export type MetricsOptions = {
  enabled: Boolean,
  adapters: Array<MetricExporter>,
  defaultBuckets: Array<number>
}
