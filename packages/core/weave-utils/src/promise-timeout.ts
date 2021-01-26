const defaultError = new Error('Promise timed out.')

export function promiseTimeout(ms: number, promise: Promise<any>, error: Error = defaultError): Promise<any> {
  let id

  const timeout = new Promise((_, reject) => {
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
