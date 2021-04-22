/**
 * @typedef {import('../types.js').Runtime} Runtime
 * @typedef {import('../types.js').Broker} Broker
 * @typedef {import('../types.js').Transport} Transport
*/

const { createLogger: createDefaultLogger } = require('./index')
const os = require('os')
exports.initLogger = (runtime) => {
  const loggerFactory = (runtime, moduleName, additional = {}) => {
    const bindings = {
      nodeId: runtime.options.nodeId,
      moduleName,
      pid: process.pid,
      hostname: os.hostname,
      ...additional
    }

    // if (service) {
    //   bindings.service = service
    // } else {
    //   bindings.moduleName = moduleName
    // }

    if (typeof runtime.options.logger === 'function') {
      return runtime.options.logger(bindings, runtime.options.level)
    }

    // Only show info in production mode
    if (process.env.NODE_ENV === 'production') {
      runtime.options.logger.level = runtime.options.logger.level || 'info'
    } else if (process.env.NODE_ENV === 'test') {
      runtime.options.logger.level = runtime.options.logger.level || 'error'
    } else {
      runtime.options.logger.level = runtime.options.logger.level || 'debug'
    }

    const loggerOptions = Object.assign({}, runtime.options.logger, {
      base: {
        ...bindings
      }
    })

    return createDefaultLogger(loggerOptions)
  }

  const createLogger = (moduleName, service) => loggerFactory(runtime, moduleName, service)

  // create weave default logger
  const log = createLogger('WEAVE')

  Object.assign(runtime, {
    createLogger,
    log
  })
}
