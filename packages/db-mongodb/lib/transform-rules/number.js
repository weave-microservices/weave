module.exports = function checkAny (value, schema) {
    if (schema.convert && typeof value !== 'number') {
        value = Number(value)
    }
    return value
}
