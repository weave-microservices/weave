module.exports = function checkNumber ({ schema, messages }) {
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
    }
  `)

  if (schema.min) {
    code.push(`
      if (value < ${schema.min}) {
        ${this.makeErrorCode({ type: 'numberMin', passed: 'value', expected: schema.min, messages })}
      }
    `)
  }

  if (schema.max) {
    code.push(`
      if (value > ${schema.max}) {
        ${this.makeErrorCode({ type: 'numberMax', passed: 'value', expected: schema.max, messages })}
      }
    `)
  }

  if (schema.equal) {
    code.push(`
      if (value !== ${schema.equal}) {
        ${this.makeErrorCode({ type: 'numberEqual', passed: 'value', expected: schema.equal, messages })}
      }
    `)
  }

  if (schema.notEqual) {
    code.push(`
      if (value === ${schema.notEqual}) {
        ${this.makeErrorCode({ type: 'numberNotEqual', passed: 'value', expected: schema.notEqual, messages })}
      }
    `)
  }

  if (schema.integer) {
    code.push(`
      if (value % 1 !== 0) {
        ${this.makeErrorCode({ type: 'numberInteger', passed: 'value', messages })}
      }
    `)
  }

  if (schema.positive) {
    code.push(`
      if (value <= 0) {
        ${this.makeErrorCode({ type: 'numberPositive', passed: 'value', messages })}
      }
    `)
  }

  if (schema.negative) {
    code.push(`
      if (value >= 0) {
        ${this.makeErrorCode({ type: 'numberNegative', passed: 'value', messages })}
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
