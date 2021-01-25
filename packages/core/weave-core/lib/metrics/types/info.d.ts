import BaseMetricType from './base';
export default class Gauge extends BaseMetricType {
    value: number;
    constructor(store: any, obj: any);
    generateSnapshot(): {
        value: any;
        labels: any;
        labelString: any;
    }[];
    set(value: any, labels: any, timestamp: any): any;
}
