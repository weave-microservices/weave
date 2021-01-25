import { TracingCollector } from "../interfaces/tracig-collector.interface";
export declare type TracingOptions = {
    enabled: Boolean;
    samplingRate: number;
    collectors: Array<TracingCollector>;
};
