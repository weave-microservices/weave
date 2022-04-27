import os from 'os';
import { LoggerRuntime } from "../LoggerRuntime";

exports.asJson = (runtime: LoggerRuntime, originObject: object, message: string, logLevelValue: number, timestamp: number) => {
  const data = {
    level: logLevelValue,
    timestamp,
    ...runtime.fixtures
  };

  if (message !== undefined) {
    data[runtime.options.messageKey] = message;
  }

  const doesNotHaveOwnProperty = originObject.hasOwnProperty === undefined;

  let value;
  for (const key in originObject) {
    value = originObject[key];
    if ((doesNotHaveOwnProperty || originObject.hasOwnProperty(key)) && value !== undefined) {
      data[key] = value;
    }
  }

  return JSON.stringify(data) + os.EOL;
};
