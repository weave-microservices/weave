import { MetricRegistrationObject } from "../types/metric-registration-object";
import { Broker } from "./broker.interface";
import { Logger } from "./logger.interface";
import { Metric } from "./metric.interface";
export interface MetricRegistry {
    broker: Broker;
    options: any;
    log: Logger;
    init(): void;
    register(metricObject: MetricRegistrationObject): Metric;
    increment(name: string, labels: any, value: number, timestamp: number): void;
    decrement(name: string, labels: any, value: number, timestamp: number): void;
    timer(name: string, labels: any, timestamp: any): void;
    getMetric(name: string): Metric;
    list(): any;
}
