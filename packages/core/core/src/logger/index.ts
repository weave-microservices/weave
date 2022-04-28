/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2019 Fachwerk
 */

import { LoggerOptions } from "./LoggerOptions";
import { LoggerRuntime } from "./LoggerRuntime";

import { Logger } from "./Logger";
const { initBase } = require('./base');
const { asJson, asHumanReadable } = require('./format/index');
const { mappings } = require('./levels');
const { coreFixtures } = require('./tools');

const createLogger = function (options: LoggerOptions): Logger {
  const instance: Partial<Logger> = {};

  const runtime: LoggerRuntime = {
    options,
    logMethods: {},
    destination: options.destination,
    formatter: process.stdout.isTTY ? asHumanReadable : asJson
  };

  if (options.enabled === false) {
    options.level = 'silent';
  }

  if (options.base !== null) {
    if (options.name === undefined) {
      runtime.fixtures = coreFixtures(options.base);
    } else {
      runtime.fixtures = coreFixtures(Object.assign({}, options.base, { name: options.name }));
    }
  }

  if (options.mixin && typeof options.mixin !== 'function') {
    throw Error(`Unknown mixin type "${typeof options.mixin}" - expected "function"`);
  } else if (options.mixin) {
    runtime.mixin = options.mixin;
  }

  const levels = mappings(options.customLevels);

  // merge levels in logger runtime
  Object.assign(runtime, { levels });

  initBase(runtime);

  runtime.setLevel(options.level);

  Object.assign(instance, {
    levels,
    ...runtime.logMethods
  });

  return instance;
};

export { createLogger }
