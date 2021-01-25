export interface MetricExporter {
    init(registry: any): void;
    metricChanged(metric: any): void;
}
