import { LoggerRuntime } from "./LoggerRuntime";
import { LogLevel } from "./LogLevel";

export type DefaultLogLevels = 'silent' | 'verbose' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export type LogMethodHook = (this: LoggerRuntime) => void

export type LoggerOptions = {
  enabled: boolean;
  name?: string;
  level: DefaultLogLevels;
  messageKey?: string;
  customLevels?: LogLevel[];
  mixin?: (originObject: object) => object;
  base?: {
    pid?: number;
    hostname: string;
    [key: string]: any;
  },
  formatter: {
    messageFormat: boolean;
  }
  hooks?: {
    logMethod?: () => void
  },
  useOnlyCustomLevelsSym?: boolean;
  destination: NodeJS.WriteStream;
}