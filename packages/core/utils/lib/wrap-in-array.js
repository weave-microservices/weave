/**
 * Wraps a value in an array if it's not already an array.
 * @template T
 * @param {T | T[]} object - The value to wrap in an array
 * @returns {T[]} The value as an array
 */
module.exports.wrapInArray = (object) => Array.isArray(object) ? object : [object];
