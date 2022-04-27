import { LogMethodHook } from "./LoggerOptions";
import { LoggerRuntime } from "./LoggerRuntime";

const { format } = require('./utils/format');

const noop = () => {};

const generateLogMethod = function (runtime: LoggerRuntime, level: number, hook: LogMethodHook) {
  if (!hook) {
    return log;
  }

  return function hookWrappedLog (...args: any[]) {
    hook.call(runtime, args, log, level);
  };

  function log (origin, ...n) {
    if (typeof origin === 'object') {
      let message = origin;
      let formatParams;
      if (message === null && n.length === 0) {
        formatParams = [null];
      } else {
        message = n.shift();
        formatParams = n;
      }
      runtime.write(origin, format(message, formatParams, runtime.options.formatOptions), level);
    } else {
      runtime.write(null, format(origin, n, runtime.options.formatOptions), level);
    }
  }
};

const coreFixtures = function (object: any): any {
  return object;
};

export { noop, generateLogMethod, coreFixtures }