const crypto = require('crypto')

export function createRandomString (length: number = 12): string {
  return crypto.randomBytes(length).toString('hex')
}
