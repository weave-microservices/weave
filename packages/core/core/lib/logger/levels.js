const { generateLogMethod } = require('./tools')

const levels = {
  verbose: 60,
  debug: 50,
  info: 40,
  warn: 30,
  error: 20,
  fatal: 10
}

// wrap log methods
const levelMethods = {
  fatal: (runtime, hook) => {
    const logFatal = generateLogMethod(runtime, levels.fatal, hook)
    return function (...args) {
      logFatal.call(runtime, ...args)
      // if (typeof stream.flushSync === 'function') {
      //   try {
      //     stream.flushSync()
      //   } catch (e) {
      //     // https://github.com/pinojs/pino/pull/740#discussion_r346788313
      //   }
      // }
    }
  },
  error: (runtime, hook) => generateLogMethod(runtime, levels.error, hook),
  warn: (runtime, hook) => generateLogMethod(runtime, levels.warn, hook),
  info: (runtime, hook) => generateLogMethod(runtime, levels.info, hook),
  debug: (runtime, hook) => generateLogMethod(runtime, levels.debug, hook),
  verbose: (runtime, hook) => generateLogMethod(runtime, levels.verbose, hook)
}

exports.levelMethods = levelMethods

const numbers = Object.keys(levels).reduce((o, k) => {
  o[levels[k]] = k
  return o
}, {})

exports.mappings = (customLevels = null, useOnlyCustomLevels = false) => {
  const customNums = customLevels ? Object.keys(customLevels).reduce((o, k) => {
    o[customLevels[k]] = k
    return o
  }, {})
    : null

  const labels = Object.assign(
    Object.create(Object.prototype, { Infinity: { value: 'silent' }}),
    useOnlyCustomLevels ? null : numbers,
    customNums
  )

  const values = Object.assign(
    Object.create(Object.prototype, { silent: { value: 0 }}),
    useOnlyCustomLevels ? null : levels,
    customLevels
  )

  return { labels, values }
}

exports.isStandardLevel = (level, useOnlyCustomLevels) => {
  if (useOnlyCustomLevels) {
    return false
  }

  switch (level) {
  case 'fatal':
  case 'error':
  case 'warn':
  case 'info':
  case 'debug':
  case 'verbose':
    return true
  default:
    return false
  }
}
