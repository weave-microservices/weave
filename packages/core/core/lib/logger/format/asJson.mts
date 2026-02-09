import os from "os";
import type { LoggerContext } from "../index.mts";

/**
 * Format log output as JSON for non-TTY environments.
 * @param ctx - Logger context
 * @param originObj - Original log object
 * @param message - Log message
 * @param level - Numeric log level
 * @param time - Timestamp
 * @returns JSON formatted log string
 */
export const asJson = (
  ctx: LoggerContext,
  originObj: Record<string, unknown> | null,
  message: string,
  level: number,
  time: number,
): string => {
  const data: Record<string, unknown> = {
    level,
    time,
    ...ctx.fixtures,
  };

  if (message !== undefined) {
    data[ctx.options.messageKey] = message;
  }

  if (originObj) {
    const doesNotHaveOwnProperty = originObj.hasOwnProperty === undefined;

    let value: unknown;
    for (const key in originObj) {
      value = originObj[key];
      if ((doesNotHaveOwnProperty || Object.prototype.hasOwnProperty.call(originObj, key)) && value !== undefined) {
        data[key] = value;
      }
    }
  }

  return JSON.stringify(data) + os.EOL;
};
