module.exports = function cheackString ({ schema, messages }) {
  const code = []

  code.push(`
        if (typeof value !== 'string') {
            ${this.makeErrorCode({ type: 'string', passed: 'value', messages })}
            return value
        }
        const length = value.length
    `)

  if (schema.minLength) {
    code.push(`
            if (length < ${schema.minLength}) {
                ${this.makeErrorCode({ type: 'stringMinLength', passed: 'value', expected: schema.minLength, messages })}
                return value
            }
        `)
  }

  if (schema.maxLength) {
    code.push(`
            if (length > ${schema.maxLength}) {
                ${this.makeErrorCode({ type: 'stringMaxLength', passed: 'value', expected: `"${schema.maxLength}"`, messages })}
                return value
            }
        `)
  }

  if (schema.equal) {
    code.push(`
            if (value !== '${schema.equal}') {
                ${this.makeErrorCode({ type: 'stringEqual', passed: 'value', expected: `"${schema.equal}"`, messages })}
                return value
            }
        `)
  }

  // if (schema.contains != null && value.indexOf(schema.contains) === -1) {
  //     return this.makeError('stringContains', schema.contains, value)
  // }

  code.push(`
        return value
    `)

  return {
    code: code.join('\n')
  }
}
