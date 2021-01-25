import { Broker } from "../shared/interfaces/broker.interface";
import { MetricRegistry } from "../shared/interfaces/metric-registry.interface";
import { MetricsOptions } from "../shared/types/metrics-options.type";
export declare function createMetricRegistry(broker: Broker, options: MetricsOptions): MetricRegistry;
