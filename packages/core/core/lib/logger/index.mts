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

interface LoggerRuntime {
  options: LoggerInternalOptions;
  logMethods: Record<string, Function>;
  destination: Writable;
  formatter: (runtime: LoggerRuntime, object: any, message: string, level: number, time: number) => string;
  fixtures?: any;
  mixin?: (obj: any) => any;
  levels: {
    labels: Record<number, string>;
    values: Record<string, number>;
  };
  levelValue?: number;
  setLevel?: (level: LogLevel | string | number) => void;
  write?: (originObject: any, message: string, level: number) => void;
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
  const runtime: LoggerRuntime = {
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
      runtime.fixtures = coreFixtures(mergedOptions.base);
    } else {
      runtime.fixtures = coreFixtures(Object.assign({}, mergedOptions.base, { name: mergedOptions.name }));
    }
  }

  if (mergedOptions.mixin && typeof mergedOptions.mixin !== "function") {
    throw Error(`Unknown mixin type "${typeof mergedOptions.mixin}" - expected "function"`);
  } else if (mergedOptions.mixin) {
    runtime.mixin = mergedOptions.mixin;
  }

  const levels = mappings(mergedOptions.customLevels);

  // merge levels in logger runtime
  runtime.levels = levels;

  initBase(runtime);

  runtime.setLevel!(mergedOptions.level!);

  Object.assign(instance, {
    level: mergedOptions.level,
    ...runtime.logMethods,
  });

  return instance;
};
