export default class BaseMetricType {
    description: any;
    labels: any;
    name: any;
    registry: any;
    type: any;
    values: any;
    constructor(registry: any, obj: any);
    stringifyLabels(labels: any): string;
    get(labels: any): any;
    generateSnapshot(): void;
    snapshot(): void;
    toObject(): {
        type: any;
        name: any;
        description: any;
        value: void;
    };
}
