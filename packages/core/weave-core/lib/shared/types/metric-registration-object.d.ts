import { MetricLabel } from "./metric-label.interface";
export declare type MetricRegistrationObject = {
    type: string;
    name: string;
    description?: string;
    labels?: Array<MetricLabel>;
};
