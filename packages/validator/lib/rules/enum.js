module.exports = function checkArray (value, schema) {
    const enumString = JSON.stringify(schema.values || [])

    if (enumString.indexOf(value)) {
        return this.makeError('enumValue', null, typeof values)
    }

    return true
}
