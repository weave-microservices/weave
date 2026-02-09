import { WeaveError } from "../errors.mts";
import { isStandardLevel, levelMethods } from "./levels.mts";
import { noop, generateLogMethod } from "./tools.mts";
import type { LoggerContext } from "./index.mts";
import type { LogLevel } from "../../types/index.js";

/**
 * Initialize base logger methods on the logger context.
 * @param ctx - Logger context (internal state)
 */
export const initBase = (ctx: LoggerContext): void => {
  ctx.setLevel = (level: LogLevel | string | number): void => {
    const { labels, values } = ctx.levels;

    // Handle number values for level
    if (typeof level === "number") {
      if (labels[level] === undefined) {
        throw new WeaveError(`Unknown level value: "${level}"`);
      }
      level = labels[level];
    }

    // Handle unknown log levels
    if (values[level as string] === undefined) {
      throw new WeaveError(`Unknown level: "${level}"`);
    }

    const levelVal = (ctx.levelValue = values[level as string]);
    const useOnlyCustomLevelsVal = ctx.options.useOnlyCustomLevelsSym;
    const hook = ctx.options.hooks.logMethod;

    for (const key in values) {
      if (levelVal < values[key]) {
        ctx.logMethods[key] = noop;
        continue;
      }
      ctx.logMethods[key] = isStandardLevel(key, useOnlyCustomLevelsVal)
        ? levelMethods[key](ctx, hook)
        : generateLogMethod(ctx, values[key], hook);
    }
  };

  ctx.write = (originObject: unknown, message: string, level: number): void => {
    const isErrorObject = originObject instanceof Error;
    const mixin = ctx.mixin;
    const time = Date.now();
    let object: Record<string, unknown>;

    if (originObject === undefined || originObject === null) {
      object = mixin ? mixin({}) : {};
    } else {
      object = Object.assign(
        mixin ? mixin(originObject as Record<string, unknown>) : {},
        originObject as Record<string, unknown>,
      );

      // If the object is an error object, we set the message to the error message.
      if (!message && isErrorObject) {
        message = (originObject as Error).message;
      }

      if (isErrorObject) {
        object.stack = (originObject as Error).stack;
        if (!object.type) {
          object.type = "Error";
        }
      }
    }

    const logString = ctx.formatter(ctx, object, message, level, time);

    ctx.destination.write(logString);
  };
};
