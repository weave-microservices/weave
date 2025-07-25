/**
 * Remove falsy values from array
 * @param {Array<any>} arr Array
 * @returns {Array<any>} Compacted array
*/
exports.compact = arr => arr.filter(Boolean);
