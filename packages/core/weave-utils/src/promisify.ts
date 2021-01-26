export function promisify (callback: Function): Function {
  return function makePromisedFunction () {
    const args = arguments
    return new Promise((resolve, reject) => {
      try {
        return resolve(callback.apply(this, args))
      } catch (error) {
        return reject(error)
      }
    })
  }
}
