import {
  green,
  magenta,
  red,
  yellow,
  gray,
  cyan,
  lightGray,
  colorizeJson,
} from "../utils/colorize.mts";
import os from "os";
import type { LoggerContext } from "../index.mts";

/**
 * Color function type for log levels
 */
type ColorFunction = (txt: string) => string;

/**
 * Log level color mapping
 */
const logLevelColors: Record<string, ColorFunction> = {
  fatal: magenta,
  error: red,
  warn: yellow,
  info: green,
  debug: cyan,
  verbose: gray,
};

/**
 * Format log output as human-readable colored text for TTY.
 * @param ctx - Logger context
 * @param originObj - Original log object
 * @param message - Log message
 * @param level - Numeric log level
 * @param time - Timestamp
 * @returns Formatted log string
 */
export const asHumanReadable = (
  ctx: LoggerContext,
  originObj: Record<string, unknown> | null,
  message: string,
  level: number,
  time: number,
): string => {
  let logResult = "";

  const labelsObj = ctx.levels.labels;
  const currentLabel = labelsObj[level];
  const allLabels = Object.values(labelsObj) as string[];
  const maxLabelWidth = Math.max(...allLabels.map((l) => l.toUpperCase().length));
  const label = currentLabel?.toUpperCase() ?? "UNKNOWN";
  const paddedLabel = label.padStart(maxLabelWidth, " ");
  const color = logLevelColors[currentLabel] || yellow;

  logResult += lightGray(new Date(time).toISOString()) + " ";
  logResult += color(paddedLabel);

  if (ctx.options.base?.pid && ctx.options.base?.hostname) {
    const labelParts: string[] = [];
    if (ctx.options.base?.nodeId) {
      labelParts.push(String(ctx.options.base.nodeId));
    }
    if (ctx.options.base?.svc) {
      labelParts.push(String(ctx.options.base.svc));
    }
    if (ctx.options.base?.action) {
      labelParts.push(String(ctx.options.base.action));
    }
    // if (ctx.options.base?.pid) {
    //   labelParts.push(ctx.options.base.pid);
    // }
    // if (ctx.options.base?.hostname) {
    //   labelParts.push(ctx.options.base.hostname);
    // }
    logResult += lightGray(` ${labelParts.join("::")}`);
  }

  if (message) {
    logResult += " " + message;
  }

  if (originObj && typeof originObj === "object" && Object.keys(originObj).length > 0) {
    logResult += os.EOL;
    logResult += colorizeJson(originObj);
  }

  logResult += os.EOL;

  return logResult;
};
