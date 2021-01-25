import { LogLevel } from "../enums/log-level.enum";
export declare type LogType = {
    badge: string;
    color: string;
    label: string;
    logLevel: LogLevel;
    stream?: WritableStream;
};
