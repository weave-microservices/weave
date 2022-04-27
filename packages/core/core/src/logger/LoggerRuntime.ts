import { LoggerOptions } from "./LoggerOptions";
import { LogLevel } from "./LogLevel";

export type LoggerRuntime = {
  options: LoggerOptions;
  mixin?: (originObject: object) => object;
  levels: any;
  levelValue: number;
  logMethods: {
    [key: string]: () => void;
  },
  write: (originObject: object, message: string, logLevelValue: number) => void;
  destination: NodeJS.WriteStream;
  formatter: (runtime: LoggerRuntime, logObject: object, message: string, logValue: number, timestamp: number) => string;
  fixtures: object;
  setLevel: (level: string) => void;
}