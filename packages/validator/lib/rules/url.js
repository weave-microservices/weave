const PATTERN = /^https?:\/\/\S+/

module.exports = function checkUrl (value) {
    if (typeof value !== 'string') {
        return this.makeError('string')
    }

    if (!PATTERN.test(value)) {
        return this.makeError('url')
    }

    return true
}
