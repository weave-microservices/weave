const { WeaveError } = require('../errors');
const { isStandardLevel, levelMethods } = require('./levels');
const { noop, generateLogMethod } = require('./tools');

/**
 * Converts an error into a plain, serializable object.
 *
 * Error properties like "message" and "stack" are not enumerable, so an error
 * that is nested inside a log object would be serialized as "{}" and the whole
 * stack trace would be lost.
 * @param {Error} error - The error to serialize
 * @returns {object} Serializable representation of the error
 */
const serializeError = (error) => {
  const result = {
    type: error.name || 'Error',
    message: error.message,
    stack: error.stack
  };

  // Keep additional properties of custom errors (e.g. "code" or "data").
  for (const key in error) {
    if (result[key] === undefined) {
      result[key] = error[key];
    }
  }

  return result;
};

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
      } else {
        // Serialize nested errors, otherwise they would end up as "{}" in the log.
        for (const key in object) {
          if (object[key] instanceof Error) {
            object[key] = serializeError(object[key]);
          }
        }
      }
    }

    const logString = runtime.formatter(runtime, object, message, number, time);

    runtime.destination.write(logString);
  };
};
