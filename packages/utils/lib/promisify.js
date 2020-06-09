module.exports.promisify = function promisify (callback, options = { scope: {}}) {
  return function makePromisedFunction () {
    const args = arguments
    return new Promise((resolve, reject) => {
      try {
        return resolve(callback.apply(options.scope, args))
      } catch (error) {
        return reject(error)
      }
    })
  }
}
