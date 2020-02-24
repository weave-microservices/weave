module.exports = function checkNumber ({ schema, messages }, path, context) {
    const code = []
    let sanitized = false

    if (schema.convert) {
        sanitized = true
        code.push(`
            if (typeof value !== 'number') {
                value = Number(value)
            }
        `)
    }

    code.push(`
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
            ${this.makeErrorCode({ type: 'number',  actual: 'value', messages })}
            return value
        }
    `)

    if (schema.min) {
        code.push(`
            if (value < ${schema.min}) {
                ${this.makeErrorCode({ type: 'numberMin',  actual: 'value', expected: schema.min, messages })}
                return value
            }
        `)
    }

    if (schema.max) {
        code.push(`
            if (value > ${schema.max}) {
                ${this.makeErrorCode({ type: 'numberMax',  actual: 'value', expected: schema.max, messages })}
                return value
            }
        `)
    }

    if (schema.equal) {
        code.push(`
            if (value !== ${schema.equal}) {
                ${this.makeErrorCode({ type: 'numberEqual',  actual: 'value', expected: schema.equal, messages })}
                return value
            }
        `)
    }

    if (schema.notEqual) {
        code.push(`
            if (value === ${schema.notEqual}) {
                ${this.makeErrorCode({ type: 'numberNotEqual',  actual: 'value', messages })}
                return value
            }
        `)
    }
     // if (isNaN(value) && isFinite(value)) {
    //     return this.makeError('number', null, typeof value)
    // }
    // if (schema.min && value < schema.min) {
    //     return this.makeError('numberMin', schema.min, typeof value)
    // }

    // if (schema.max && value > schema.max) {
    //     return this.makeError('numberMax', schema.max, typeof value)
    // }

    // if (schema.integer === true && value % 1 !== 0) {
    //     return this.makeError('numberInteger', value)
    // }

    return {
        sanitized,
        code: code.join('\n')
    }
}
