module.exports = function cheackString ({ schema, messages }, path, context) {
    const code = []
    let sanitized = false

    code.push(`
        if (typeof value !== 'string') {
            ${this.makeErrorCode({ type: 'string', actual: 'value', messages })}
            return value
        }
    `)

    // if (typeof value !== 'string') {
    //     return this.makeError('string', null, typeof value)
    // }

    // const length = value.length
    // if (schema.minLength != null && length < schema.minLength) {
    //     return this.makeError('stringMin', schema.minLength, length)
    // }

    // if (schema.maxLength != null && length > schema.maxLength) {
    //     return this.makeError('stringMax', schema.maxLength, length)
    // }

    // if (schema.equal != null && value !== schema.equal) {
    //     return this.makeError('stringEqual', schema.equal, value)
    // }

    // if (schema.contains != null && value.indexOf(schema.contains) === -1) {
    //     return this.makeError('stringContains', schema.contains, value)
    // }

    return {
        sanitized,
        code
    }
}
