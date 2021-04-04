/**
 * @typedef {import('../types.js').Runtime} Runtime
 * @typedef {import('../types.js').Broker} Broker
 * @typedef {import('../types.js').Transport} Transport
*/

const { createDefaultLogger } = require('./index')

exports.initLogger = (runtime) => {
  const loggerFactory = (runtime, moduleName, service) => {
    const bindings = {
      nodeId: runtime.options.nodeId
    }

    if (service) {
      bindings.service = service
    } else {
      bindings.moduleName = moduleName
    }

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

    const loggerOptons = Object.assign({}, runtime.options.logger, {
      defaultMeta: {
        ...bindings
      }
    })

    return createDefaultLogger(loggerOptons)
  }

  const createLogger = (moduleName, service) => loggerFactory(runtime, moduleName, service)

  // create weave default logger
  const log = createLogger('WEAVE')

  Object.assign(runtime, {
    createLogger,
    log
  })
}
