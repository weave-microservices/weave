import { MetricExporter } from "../interfaces/metric-exporter.interface";
export declare type MetricsOptions = {
    enabled: Boolean;
    adapters: Array<MetricExporter>;
    defaultBuckets: Array<number>;
};
