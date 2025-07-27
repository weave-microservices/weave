/**
 * Flattens an array of arrays into a single array (one level deep).
 * @template T
 * @param {Array<T[]>} arr - Array of arrays to flatten
 * @returns {T[]} Flattened array
 * @example
 * flatten([[1, 2], [3, 4], [5]]); // [1, 2, 3, 4, 5]
 */
exports.flatten = (arr) => arr.reduce((a, b) => a.concat(b), []);
