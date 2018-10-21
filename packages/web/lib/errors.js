const { WeaveError } = require('@weave-js/core').Errors

class RateLimitExeededError extends WeaveError {
    constructor () {
        super(`Too many requests.`, 429)
    }
}

module.exports = { RateLimitExeededError }
