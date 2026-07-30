import { format } from "./utils/format.mts";
import type { LoggerContext } from "./index.mts";

/**
 * Log hook function type
 */
type LogHook =
  | ((args: unknown[], log: (...args: unknown[]) => void, level: number) => void)
  | undefined;

/**
 * No-operation function for disabled log levels.
 */
export const noop = (): void => {};

/**
 * Generate a log method for a specific level.
 * @param ctx - Logger context
 * @param level - Numeric log level
 * @param hook - Optional log hook
 * @returns Log method function
 */
export const generateLogMethod = (
  ctx: LoggerContext,
  level: number,
  hook: LogHook,
): ((...args: unknown[]) => void) => {
  if (!hook) {
    return log;
  }

  return function hookWrappedLog(...args: unknown[]): void {
    hook.call(ctx, args, log, level);
  };

  function log(message: unknown, meta?: unknown): void {
    // If message is a string and meta is provided
    if (typeof message === "string") {
      if (meta && typeof meta === "object") {
        // New signature: log.info("message", { meta })
        ctx.write!(meta, message, level);
      } else if (meta && typeof meta === "string") {
        // Legacy support: log.info("message", "extra string")
        ctx.write!(null, format(message, [meta], ctx.options.formatOptions), level);
      } else {
        // Just a message: log.info("message")
        ctx.write!(null, message, level);
      }
    } else if (typeof message === "object" && message !== null) {
      // Legacy support: log.info({ error }, "message")
      if (meta && typeof meta === "string") {
        ctx.write!(message, meta, level);
      } else {
        // Just an object: log.info({ data })
        ctx.write!(message, "", level);
      }
    } else {
      // Fallback
      ctx.write!(null, String(message), level);
    }
  }
};

/**
 * Create core fixtures from base options.
 * @param object - Base object with fixtures
 * @returns Fixtures object
 */
export const coreFixtures = (object: Record<string, unknown>): Record<string, unknown> => {
  return object;
};
