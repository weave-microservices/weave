const crypto = require('crypto')

const getHash = (value) => {
  return crypto.createHash('sha256').update(value).digest('hex')
}

module.exports = { getHash }