import BaseMetricType from './base';
export default class Histogram extends BaseMetricType {
    value: number;
    buckets: Array<number>;
    constructor(registry: any, obj: any);
    observe(value: any, labels: any, timestamp: any): void;
    decrement(labels: any, value: any, timestamp: any): void;
    generateSnapshot(): {
        key: unknown;
        value: any;
        labels: any;
    }[];
    set(labels: any, value: any, timestamp?: number): any;
}
