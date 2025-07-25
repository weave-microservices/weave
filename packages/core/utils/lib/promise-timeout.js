const defaultError = new Error('Promise timed out.');

/**
 * Execute a promise with a timeout
 * @template T
 * @param {number} ms timeout in milliseconds
 * @param {Promise<T>} promise Promise
 * @param {*} [error] Error
 * @returns {Promise<T>} Promise
 */
exports.promiseTimeout = function promiseTimeout (ms, promise, error = defaultError) {
  let id;

  const timeout = new Promise((resolve, reject) => {
    id = setTimeout(() => {
      clearTimeout(id);
      reject(error);
    }, ms);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([
    promise,
    timeout
  ]).then((result) => {
    clearTimeout(id);
    return result;
  });
};
