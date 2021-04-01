const { isFunction, uuid } = require('@weave-js/utils')

exports.generateUUID = (runtime) => {
  if (runtime.options.uuidFactory && isFunction(runtime.options.uuidFactory)) {
    return runtime.options.uuidFactory(runtime)
  }
  return uuid()
}
