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
      ${this.makeErrorCode({ type: 'number', passed: 'value', messages })}
      return value
    }
  `)

  if (schema.min) {
    code.push(`
      if (value < ${schema.min}) {
        ${this.makeErrorCode({ type: 'numberMin', passed: 'value', expected: schema.min, messages })}
        return value
      }
    `)
  }

  if (schema.max) {
    code.push(`
      if (value > ${schema.max}) {
        ${this.makeErrorCode({ type: 'numberMax', passed: 'value', expected: schema.max, messages })}
        return value
      }
    `)
  }

  if (schema.equal) {
    code.push(`
      if (value !== ${schema.equal}) {
        ${this.makeErrorCode({ type: 'numberEqual', passed: 'value', expected: schema.equal, messages })}
        return value
      }
    `)
  }

  if (schema.notEqual) {
    code.push(`
      if (value === ${schema.notEqual}) {
        ${this.makeErrorCode({ type: 'numberNotEqual', passed: 'value', expected: schema.notEqual, messages })}
        return value
      }
    `)
  }

  code.push(`
    return value
  `)

  return {
    sanitized,
    code: code.join('\n')
  }
}
