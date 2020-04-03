const PATTERN = /^https?:\/\/\S+/

module.exports = function checkUrl ({ schema, messages }) {
  const code = []

  code.push(`
        if (typeof value !== 'string') {
            ${this.makeErrorCode({ type: 'string', passed: 'value', messages })}
            return value
        }
    `)

  code.push(`
        if (!${PATTERN.toString()}.test(value)) {
            ${this.makeErrorCode({ type: 'url', passed: 'value', messages })}
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
