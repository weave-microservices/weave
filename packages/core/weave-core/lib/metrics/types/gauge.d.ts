import BaseMetricType from './base';
export default class Gauge extends BaseMetricType {
    value: number;
    constructor(store: any, obj: any);
    increment(labels: any, value: any, timestamp: any): void;
    decrement(labels: any, value: any, timestamp: any): void;
    generateSnapshot(): {
        key: unknown;
        value: any;
        labels: any;
    }[];
    set(labels: any, value: any, timestamp?: number): any;
}
