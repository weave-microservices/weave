/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2019 Fachwerk
 */

const os = require('os');
const { initBase } = require('./base');
const { asJson, asHumanReadable } = require('./format');
const { mappings } = require('./levels');
const { coreFixtures } = require('./tools');

const { pid } = process;
const hostname = os.hostname();

const defaultOptions = {
  enabled: true,
  level: 'info',
  messageKey: 'message',
  customLevels: null,
  base: {
    pid,
    hostname
  },
  hooks: {
    logMethod: undefined
  },
  formatter: {
    messageFormat: false
  },
  destination: process.stdout
};

exports.createLogger = (options) => {
  options = Object.assign(defaultOptions, options);

  const instance = {};
  const runtime = {
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
