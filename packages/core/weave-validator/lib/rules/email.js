
const PRECISE_PATTERN = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const BASIC_PATTERN = /^\S+@\S+\.\S+$/

module.exports = function checkEmail ({ schema, messages }) {
  const code = []
  const pattern = schema.mode === 'precise' ? PRECISE_PATTERN : BASIC_PATTERN

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
