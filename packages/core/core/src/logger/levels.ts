import { LogMethodHook } from "./LoggerOptions";
import { LoggerRuntime } from "./LoggerRuntime";
import { LogLevel } from "./LogLevel";
import { generateLogMethod } from './tools';

const levels: LogLevel = {
  verbose: 60,
  debug: 50,
  info: 40,
  warn: 30,
  error: 20,
  fatal: 10
};

// wrap log methods
const levelMethods = {
  fatal: (runtime: LoggerRuntime, hook: LogMethodHook) => {
    const logFatal = generateLogMethod(runtime, levels.fatal, hook);
    return function (...args) {
      logFatal.call(runtime, ...args);
      // if (typeof stream.flushSync === 'function') {
      //   try {
      //     stream.flushSync()
      //   } catch (e) {
      //     // https://github.com/pinojs/pino/pull/740#discussion_r346788313
      //   }
      // }
    };
  },
  error: (runtime: LoggerRuntime, hook: LogMethodHook) => generateLogMethod(runtime, levels.error, hook),
  warn: (runtime: LoggerRuntime, hook: LogMethodHook) => generateLogMethod(runtime, levels.warn, hook),
  info: (runtime: LoggerRuntime, hook: LogMethodHook) => generateLogMethod(runtime, levels.info, hook),
  debug: (runtime: LoggerRuntime, hook: LogMethodHook) => generateLogMethod(runtime, levels.debug, hook),
  verbose: (runtime: LoggerRuntime, hook: LogMethodHook) => generateLogMethod(runtime, levels.verbose, hook)
};

const numbers = Object.keys(levels)
  .reduce((o, k) => {
    o[levels[k]] = k;
    return o;
  }, {});

const mappings = function (customLevels = null, useOnlyCustomLevels: boolean = false) {
  const customNums = customLevels ? Object.keys(customLevels).reduce((o, k) => {
    o[customLevels[k]] = k;
    return o;
  }, {})
    : null;

  const labels = Object.assign(
    Object.create(Object.prototype, { Infinity: { value: 'silent' }}),
    useOnlyCustomLevels ? null : numbers,
    customNums
  );

  // Merge log levels with "silent" log level.
  const values = Object.assign(
    Object.create(Object.prototype, { silent: { value: 0 }}),
    useOnlyCustomLevels ? null : levels,
    customLevels
  );

  return { labels, values };
};

const isStandardLevel = function (level: string, useOnlyCustomLevels: boolean): boolean {
  if (useOnlyCustomLevels) {
    return false;
  }

  switch (level) {
  case 'fatal':
  case 'error':
  case 'warn':
  case 'info':
  case 'debug':
  case 'verbose':
    return true;
  default:
    return false;
  }
};

export { levelMethods, mappings, isStandardLevel }