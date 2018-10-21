module.exports = function checkDate (value, schema) {
    if (!value instanceof Date) {
        return new Date(value)
    }
    return value
}
