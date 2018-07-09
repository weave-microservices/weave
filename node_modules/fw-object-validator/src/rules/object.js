module.exports = function checkObject (value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return this.makeError('object', null, typeof value)
    }
    return true
}
