module.exports = function checkDate ({ schema, messages }) {
  const code = []
  let isSanitized = false

  code.push(`
    const initialValue = value
  `)

  if (schema.convert) {
    isSanitized = true
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

  code.push(`
    return value
  `)

  return {
    isSanitized,
    code: code.join('\n')
  }
}
