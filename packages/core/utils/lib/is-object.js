/**
 * Checks if a value is a valid object.
 * @param {any} obj Object to check
 * @returns {boolean}
 */
exports.isObject = (obj) => obj ? typeof obj === 'object' : false;
