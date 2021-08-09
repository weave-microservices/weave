module.exports = function checkArray ({ schema, messages }, path, context) {
  const code = []

  code.push(`
    if (!Array.isArray(value)) {
      ${this.makeErrorCode({ type: 'array', actual: 'value', messages })}
      return value
    }

    const length = value.length
  `)

  if (schema.minLength) {
    code.push(`
      if (length < ${schema.minLength}) {
          ${this.makeErrorCode({ type: 'arrayMinLength', passed: 'value', expected: schema.minLength, messages })}
      }
    `)
  }

  if (schema.maxLength) {
    code.push(`
      if (length > ${schema.maxLength}) {
        ${this.makeErrorCode({ type: 'arrayMaxLength', passed: 'value', expected: schema.maxLength, messages })}
      }
    `)
  }

  if (schema.length) {
    code.push(`
      if (length !== ${schema.length}) {
        ${this.makeErrorCode({ type: 'arrayLength', passed: 'value', expected: schema.length, messages })}
      }
    `)
  }

  if (schema.contains) {
    code.push(`
      if (value.indexOf(${JSON.stringify(schema.contains)}) === -1) {
        ${this.makeErrorCode({ type: 'arrayContains', passed: 'value', expected: JSON.stringify(schema.contains), messages })}
      }
    `)
  }

  if (schema.itemType) {
    code.push(`
      const array = value
      const parentField = field
      for (let i = 0; i < array.length; i++) {
    `)

    const rule = this.getRuleFromSchema(schema.itemType)
    code.push(this.compileRule(rule, context, path, 'array[i] = context.func[##INDEX##](array[i], (parentField ? parentField : "") + "[" + i + "]", parent, errors, context)', 'array[i]'))
    code.push(`
      }
    `)
  }

  code.push(`
    return value
  `)

  return {
    code: code.join('\n')
  }
}
