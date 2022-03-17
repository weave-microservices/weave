const crypto = require('crypto');

exports.createRandomString = function createRandomString (length = 12) {
  return crypto.randomBytes(length).toString('hex');
};
