const { WeaveError } = require('../errors');
const { isStandardLevel, levelMethods } = require('./levels');
const { noop, generateLogMethod } = require('./tools');

exports.initBase = (runtime) => {
  runtime.setLevel = (level) => {
    const { labels, values } = runtime.levels;

    // Handle number values for level
    if (typeof level === 'number') {
      if (labels[level] === undefined) {
        throw new WeaveError(`Unknown level value: "${level}"`);
      }
      level = labels[level];
    }

    // Handle unknown log levels
    if (values[level] === undefined) {
      throw new WeaveError(`Unknown level: "${level}"`);
    }

    const levelVal = runtime.levelValue = values[level];
    const useOnlyCustomLevelsVal = runtime.options.useOnlyCustomLevelsSym;
    const hook = runtime.options.hooks.logMethod;

    for (const key in values) {
      if (levelVal < values[key]) {
        runtime.logMethods[key] = noop;
        continue;
      }
      runtime.logMethods[key] = isStandardLevel(key, useOnlyCustomLevelsVal) ? levelMethods[key](runtime, hook) : generateLogMethod(runtime, values[key], hook);
    }
  };

  runtime.write = (originObject, message, number) => {
    const isErrorObject = originObject instanceof Error;
    const mixin = runtime.mixin;
    const time = Date.now();
    let object;

    if (originObject === undefined || originObject === null) {
      object = mixin ? mixin({}) : {};
    } else {
      object = Object.assign(mixin ? mixin(originObject) : {}, originObject);

      // If the object is an error object, we set the message to the error message.
      if (!message && isErrorObject) {
        message = originObject.message;
      }

      if (isErrorObject) {
        object.stack = originObject.stack;
        if (!object.type) {
          object.type = 'Error';
        }
      }
    }

    const logString = runtime.formatter(runtime, object, message, number, time);

    runtime.destination.write(logString);
  };
};
