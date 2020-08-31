module.exports.promisify = function promisify (callback) {
  return function makePromisedFunction () {
    const args = arguments
    return new Promise((resolve, reject) => {
      try {
        return resolve(callback(...args))
      } catch (error) {
        return reject(error)
      }
    })
  }
}
