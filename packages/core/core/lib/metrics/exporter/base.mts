import { WeaveError } from "../../errors.mts";
import type { BaseMetric, MetricRegistry, Broker } from "../../../types/index.js";

/**
 * Options for the metric exporter adapter
 */
export interface MetricExporterOptions {
  eventName?: string;
  interval?: number;
  [key: string]: unknown;
}

/**
 * Metric exporter adapter interface
 */
export interface MetricExporterAdapter {
  options: MetricExporterOptions;
  registry: MetricRegistry & { broker: Broker };
  timer?: ReturnType<typeof setInterval>;
  init(registry: MetricRegistry & { broker: Broker }): void;
  stop(): Promise<void>;
  metricChanged?(metric: BaseMetric): void;
}

export default (options?: MetricExporterOptions): MetricExporterAdapter => {
  const adapter: MetricExporterAdapter = {
    options: options || {},
    registry: undefined as unknown as MetricRegistry & { broker: Broker },
    timer: undefined,
    init(registry: MetricRegistry & { broker: Broker }): void {
      throw new WeaveError("Init method not implemented");
    },
    stop(): Promise<void> {
      return Promise.resolve();
    },
  };

  return adapter;
};
