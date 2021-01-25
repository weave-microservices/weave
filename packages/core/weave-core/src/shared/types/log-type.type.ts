import { LogLevel } from "../enums/log-level.enum";

export type LogType = {
  badge: string,
  color: string,
  label: string,
  logLevel: LogLevel,
  stream?: WritableStream
}