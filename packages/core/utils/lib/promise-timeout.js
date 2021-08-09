const defaultError = new Error('Promise timed out.')

exports.promiseTimeout = function promiseTimeout (ms, promise, error = defaultError) {
  let id

  const timeout = new Promise((resolve, reject) => {
    id = setTimeout(() => {
      clearTimeout(id)
      reject(error)
    }, ms)
  })

  // Returns a race between our timeout and the passed in promise
  return Promise.race([
    promise,
    timeout
  ]).then((result) => {
    clearTimeout(id)
    return result
  })
}
