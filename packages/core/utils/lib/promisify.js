/**
 * Wraps a function in a promise
 * @template {() => {}} T
 * @param {T} callback
 * @returns {() => Promise<any>}
 */
exports.promisify = function promisify (callback) {
  return function makePromisedFunction () {
    const args = arguments;
    return new Promise((resolve, reject) => {
      try {
        return resolve(callback.apply(this, args));
      } catch (error) {
        return reject(error);
      }
    });
  };
};
