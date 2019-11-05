module.exports = function forbiddenCheck (value, schema) {
    if (value !== null && value !== undefined) {
        return this.makeError('forbidden')
    }
    return true
}
