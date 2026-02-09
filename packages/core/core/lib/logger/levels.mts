import { generateLogMethod } from "./tools.mts";
import type { LoggerContext } from "./index.mts";

/**
 * Log hook function type
 */
type LogHook = ((args: unknown[], log: (...args: unknown[]) => void, level: number) => void) | undefined;

/**
 * Standard log levels with their numeric values.
 * Lower numbers = higher priority.
 */
const levels: Record<string, number> = {
  verbose: 60,
  debug: 50,
  info: 40,
  warn: 30,
  error: 20,
  fatal: 10,
};

/**
 * Level method factory functions.
 * Each creates a log method for the specified level.
 */
const levelMethods: Record<string, (ctx: LoggerContext, hook: LogHook) => (...args: unknown[]) => void> = {
  fatal: (ctx: LoggerContext, hook: LogHook) => {
    const logFatal = generateLogMethod(ctx, levels.fatal, hook);
    return function (...args: unknown[]): void {
      logFatal.call(ctx, ...args);
      // if (typeof stream.flushSync === 'function') {
      //   try {
      //     stream.flushSync()
      //   } catch (e) {
      //     // https://github.com/pinojs/pino/pull/740#discussion_r346788313
      //   }
      // }
    };
  },
  error: (ctx: LoggerContext, hook: LogHook) => generateLogMethod(ctx, levels.error, hook),
  warn: (ctx: LoggerContext, hook: LogHook) => generateLogMethod(ctx, levels.warn, hook),
  info: (ctx: LoggerContext, hook: LogHook) => generateLogMethod(ctx, levels.info, hook),
  debug: (ctx: LoggerContext, hook: LogHook) => generateLogMethod(ctx, levels.debug, hook),
  verbose: (ctx: LoggerContext, hook: LogHook) => generateLogMethod(ctx, levels.verbose, hook),
};

export { levelMethods };

const numbers: Record<number, string> = Object.keys(levels).reduce(
  (o: Record<number, string>, k: string) => {
    o[levels[k]] = k;
    return o;
  },
  {},
);

export const mappings = (customLevels: Record<string, number> | null = null, useOnlyCustomLevels = false) => {
  const customNums = customLevels
    ? Object.keys(customLevels).reduce((o: Record<number, string>, k) => {
        o[customLevels[k]] = k;
        return o;
      }, {})
    : null;

  const labels = Object.assign(
    Object.create(Object.prototype, { Infinity: { value: "silent" } }),
    useOnlyCustomLevels ? null : numbers,
    customNums,
  );

  // Merge log levels with "silent" log level.
  const values = Object.assign(
    Object.create(Object.prototype, { silent: { value: 0 } }),
    useOnlyCustomLevels ? null : levels,
    customLevels,
  );

  return { labels, values };
};

/**
 * Check if a level is a standard log level.
 * @param level - Level name to check
 * @param useOnlyCustomLevels - Whether to only use custom levels
 * @returns true if the level is a standard level
 */
export const isStandardLevel = (level: string, useOnlyCustomLevels?: boolean): boolean => {
  if (useOnlyCustomLevels) {
    return false;
  }

  switch (level) {
    case "fatal":
    case "error":
    case "warn":
    case "info":
    case "debug":
    case "verbose":
      return true;
    default:
      return false;
  }
};
