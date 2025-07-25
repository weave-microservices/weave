const tagTester = require('./helper/tag-tester');

/**
 * Checks if an value is an string.
 * @param {any} obj value to check
 * @returns {boolean}
 */
exports.isString = obj => tagTester('String')(obj);

