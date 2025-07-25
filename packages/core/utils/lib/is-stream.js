/**
 * Checks if an object is a stream object.
 * @param {any} obj Object to check
 * @returns {boolean}
 */
exports.isStream = (obj) => obj && obj.readable === true && typeof obj.on === 'function' && typeof obj.pipe === 'function';
