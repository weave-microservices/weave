/// <reference types="node" />
import { LogLevel } from "../enums/log-level.enum";
import { LogType } from "./log-type.type";
export declare type LoggerOptions = {
    enabled: Boolean;
    logLevel?: LogLevel;
    stream?: WritableStream | NodeJS.WriteStream;
    displayTimestamp?: boolean;
    displayBadge?: boolean;
    displayLabel?: boolean;
    displayModuleName?: boolean;
    displayFilename?: boolean;
    types?: {
        [key: string]: LogType;
    };
};
