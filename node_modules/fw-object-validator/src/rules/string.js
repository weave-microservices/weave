module.exports = function cheackString (value, schema) {
    if (typeof value !== 'string') {
        return this.makeError('string', null, typeof value)
    }

    const length = value.length
    if (schema.minLength != null && length < schema.minLength) {
        return this.makeError('stringMin', schema.minLength, length)
    }

    if (schema.maxLength != null && length > schema.maxLength) {
        return this.makeError('stringMax', schema.maxLength, length)
    }

    if (schema.equal != null && value !== schema.equal) {
        return this.makeError('stringEqual', schema.equal, value)
    }

    if (schema.contain != null && value.indexOf(schema.contain) === -1) {
        return this.makeError('stringContain', schema.contain, value)
    }

    return true
}
