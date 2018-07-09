const crypto = require('crypto')

function createRandomString (length) {
    length = length || 12
    return crypto.randomBytes(length).toString('hex')
}

module.exports = createRandomString
