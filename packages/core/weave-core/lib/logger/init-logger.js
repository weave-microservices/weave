/**
 * @typedef {import('../types.js').Runtime} Runtime
 * @typedef {import('../types.js').Broker} Broker
 * @typedef {import('../types.js').Transport} Transport
*/

const { defaultsDeep } = require('@weave-js/utils')
const { createLogger: createDefaultLogger } = require('./index')

exports.initLogger = (runtime) => {
  const loggerFactory = (runtime, moduleName, additional = {}) => {
    const bindings = {
      nodeId: runtime.options.nodeId,
      moduleName,
      ...additional
    }

    // custom logger generator function 
    if (typeof runtime.options.logger === 'function') {
      return runtime.options.logger(bindings, runtime.options.level)
    }

    // merge log options
    const loggerOptions = defaultsDeep(runtime.options.logger, {
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
