const crypto = require('crypto')

module.exports.createRandomString = function createRandomString (length = 12) {
  return crypto.randomBytes(length).toString('hex')
}
