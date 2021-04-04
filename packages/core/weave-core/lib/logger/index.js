/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2019 Fachwerk
 */

/** @module weave */
const { defaultsDeep } = require('@weave-js/utils')
const Logger = require('./logger')
const { levels } = require('./constants')

const isLevelEnabledFunctionName = (type) => {
  return 'is' + type.charAt(0).toUpperCase() + type.slice(1) + 'Enabled'
}

const arrayify = i => Array.isArray(i) ? i : [i]

const defaultOptions = {
  enabled: true,
  streams: [],
  defaultMeta: {},
  levels
}

exports.createDefaultLogger = (options) => {
  options = defaultsDeep(options, defaultOptions)

  // init transport streams
  options.streams = options.streams ? arrayify(options.streams) : []
  options.streams = options.streams.map(stream => {
    // todo: validate stream
    return stream(options)
  })

  class DerivedLogger extends Logger {
    // eslint-disable-next-line no-useless-constructor
    constructor (options) {
      super(options)
    }
  }

  const logger = new DerivedLogger(options)

  Object.entries(options.levels).forEach(([level, index]) => {
    if (level === 'log') {
      console.warn('Type "log" not defined: conflicts with the method "log". Use a different type name.')
      return
    }

    const createLogMethod = ({ level, options }) => {
      const isActive = options.enabled //! !loggerOptions.enabled && (LOG_LEVELS.indexOf(loggerOptions.types[typeName].level) >= LOG_LEVELS.indexOf(loggerOptions.level))
      if (isActive) {
        return function (...args) {
          const self = this || logger
          const [msg] = args

          if (args.length === 1) {
            const info = msg && msg.message && msg || { message: msg }
            info.level = level
            this.attachDefaultMetaData(info)

            self.write(info)
            return
          }

          return self.log(level, ...args)
        }
      } else {
        return () => logger
      }
    }

    DerivedLogger.prototype[level] = createLogMethod({ level, options })

    DerivedLogger.prototype[isLevelEnabledFunctionName(level)] = function () {
      return (this || logger).isLevelEnabled(level)
    }
  })

  return logger
}
