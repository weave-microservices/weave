const crypto = require('crypto');

/**
 * Create a random string
 * @param {number} length Length of the string
 * @returns {string}
 */
exports.createRandomString = function createRandomString (length = 12) {
  return crypto.randomBytes(length).toString('hex');
};
