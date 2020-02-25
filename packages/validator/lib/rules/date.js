module.exports = function checkDate ({ schema, messages }) {
  const code = []
  let sanitized = false

  code.push(`
        const initialValue = value
    `)

  if (schema.convert) {
    sanitized = true
    code.push(`
            if (!(value instanceof Date)) {
                value = new Date(value)
            }
        `)
  }

  code.push(`
        if (!(value instanceof Date) || isNaN(value.getTime())) {
            ${this.makeErrorCode({ type: 'date', passed: 'initialValue', messages })}
            return value
        }
    `)

  return {
    sanitized,
    code: code.join('\n')
  }
}
