/**
 * @template T
 * @param {Array<T[]>} arr
 * @returns
 */
exports.flatten = (arr) => arr.reduce((a, b) => a.concat(b), []);
