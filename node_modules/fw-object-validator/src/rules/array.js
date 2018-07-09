module.exports = function checkArray (values, schema) {
    if (!Array.isArray(values)) {
        return this.makeError('array', null, typeof values)
    }

    if (!Array.isArray(values)) {
        return this.makeError('array', null, typeof values)
    }

    if (schema.contains != null && schema.contains.type != null) {
        for (let i = 0; i <= values.length - 1; i++) {
            const item = values[i]
            const result = this.check(schema.contains.type, item, schema)
            if (result !== true) {
                return result
            }
        }
    }
    return true
}
