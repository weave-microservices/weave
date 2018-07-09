module.exports = function checkNumber (value, schema) {
    if (schema.convert && typeof value !== 'number') {
        value = Number(value)
    }

    if (typeof value !== 'number') {
        return this.makeError('number', null, typeof value)
    }
    if (isNaN(value) && isFinite(value)) {
        return this.makeError('number', null, typeof value)
    }
    if (schema.min && value < schema.min) {
        return this.makeError('numberMin', schema.min, typeof value)
    }

    if (schema.max && value > schema.max) {
        return this.makeError('numberMax', schema.max, typeof value)
    }

    if (schema.integer === true && value % 1 !== 0) {
        return this.makeError('numberInteger', value)
    }

    return true
}
