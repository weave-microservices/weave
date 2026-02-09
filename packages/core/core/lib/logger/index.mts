/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2019 Fachwerk
 */

import os from "os";
import type { Writable } from "stream";
import { initBase } from "./base.mts";
import { asJson, asHumanReadable } from "./format/index.mts";
import { mappings } from "./levels.mts";
import { coreFixtures } from "./tools.mts";
import type { Logger, LoggerOptions, LogLevel } from "../../types/index.js";

const { pid } = process;
const hostname = os.hostname();

interface LoggerInternalOptions {
  enabled?: boolean;
  level?: LogLevel | string;
  messageKey: string;
  customLevels: Record<string, number> | null;
  base?: Record<string, any> | null;
  name?: string;
  hooks: {
    logMethod?: (args: any[], log: Function, level: number) => void;
  };
  formatter: {
    messageFormat: boolean | string;
  };
  destination: Writable;
  mixin?: (obj: any) => any;
  useOnlyCustomLevelsSym?: boolean;
  formatOptions?: any;
}

/**
 * Logger context - internal state of the logger instance.
 * Previously named "runtime" but renamed to avoid confusion with Broker Runtime.
 */
export interface LoggerContext {
  options: LoggerInternalOptions;
  logMethods: Record<string, (...args: unknown[]) => void>;
  destination: Writable;
  formatter: (ctx: LoggerContext, object: Record<string, unknown> | null, message: string, level: number, time: number) => string;
  fixtures?: Record<string, unknown>;
  mixin?: (obj: Record<string, unknown>) => Record<string, unknown>;
  levels: {
    labels: Record<number, string>;
    values: Record<string, number>;
  };
  levelValue?: number;
  setLevel?: (level: LogLevel | string | number) => void;
  write?: (originObject: unknown, message: string, level: number) => void;
}

const defaultOptions: LoggerInternalOptions = {
  enabled: true,
  level: "info",
  messageKey: "message",
  customLevels: null,
  base: {
    pid,
    hostname,
  },
  hooks: {
    logMethod: undefined,
  },
  formatter: {
    messageFormat: false,
  },
  destination: process.stdout,
};

export const createLogger = (options?: LoggerOptions): Logger => {
  // Deep clone to avoid shared state between logger instances
  const mergedOptions: LoggerInternalOptions = Object.assign({}, defaultOptions, options);
  if (mergedOptions.base && options?.base) {
    mergedOptions.base = Object.assign({}, defaultOptions.base, options.base);
  }

  const instance = {} as Logger;
  const ctx: LoggerContext = {
    options: mergedOptions,
    logMethods: {},
    destination: mergedOptions.destination,
    formatter: process.stdout.isTTY ? asHumanReadable : asJson,
    levels: { labels: {}, values: {} },
  };

  if (mergedOptions.enabled === false) {
    mergedOptions.level = "silent";
  }

  if (mergedOptions.base !== null && mergedOptions.base !== undefined) {
    if (mergedOptions.name === undefined) {
      ctx.fixtures = coreFixtures(mergedOptions.base);
    } else {
      ctx.fixtures = coreFixtures(Object.assign({}, mergedOptions.base, { name: mergedOptions.name }));
    }
  }

  if (mergedOptions.mixin && typeof mergedOptions.mixin !== "function") {
    throw Error(`Unknown mixin type "${typeof mergedOptions.mixin}" - expected "function"`);
  } else if (mergedOptions.mixin) {
    ctx.mixin = mergedOptions.mixin;
  }

  const levels = mappings(mergedOptions.customLevels);

  // merge levels in logger context
  ctx.levels = levels;

  initBase(ctx);

  ctx.setLevel!(mergedOptions.level!);

  Object.assign(instance, {
    level: mergedOptions.level,
    ...ctx.logMethods,
  });

  return instance;
};
