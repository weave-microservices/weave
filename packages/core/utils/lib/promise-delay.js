/**
 * Execute a promise with delay
 * @template T
 * @param {Promise<T>} promise Promise
 * @param {number} ms delay in milliseconds
 * @returns {Promise<T>}
 */
exports.promiseDelay = (promise, ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(promise);
    }, ms);
  });
};
