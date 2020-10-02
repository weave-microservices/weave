module.exports.promiseDelay = (promise, ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(promise)
    }, ms)
  })
}
