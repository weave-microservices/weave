
const { EMAIL_PRECISE_PATTERN, EMAIL_BASIC_PATTERN } = require('../patterns')

module.exports = function checkEmail ({ schema, messages }) {
  const code = []
  const pattern = schema.mode === 'precise' ? EMAIL_PRECISE_PATTERN : EMAIL_BASIC_PATTERN

  code.push(`
        if (typeof value !== 'string') {
          ${this.makeErrorCode({ type: 'string', passed: 'value', messages })}
          return value
        }
    `)

  code.push(`
        if (!${pattern.toString()}.test(value)) {
          ${this.makeErrorCode({ type: 'email', passed: 'value', messages })}
          return value
        }
    `)

  code.push(`
    return value
  `)

  return {
    code: code.join('\n')
  }
}
