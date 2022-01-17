const BASE64_PATTERN = /^(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+/]{3}=)?$/

module.exports = function checkString ({ schema, messages }) {
  const code = []
  let isSanitized = false
  code.push(`
    if (typeof value !== 'string') {
      ${this.makeErrorCode({ type: 'string', passed: 'value', messages })}
      return value
    }

    const length = value.length
  `)

  // trim value
  if (schema.trim) {
    isSanitized = true
    code.push(`
			value = value.trim();
		`)
  }

  if (schema.trimLeft) {
    isSanitized = true
    code.push(`
			value = value.trimLeft();
		`)
  }

  if (schema.trimRight) {
    isSanitized = true
    code.push(`
			value = value.trimRight();
		`)
  }

  if (schema.uppercase) {
    isSanitized = true
    code.push(`
			value = value.toUpperCase();
		`)
  }

  if (schema.lowercase) {
    isSanitized = true
    code.push(`
			value = value.toLowerCase();
		`)
  }

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

  if (schema.base64) {
    code.push(`
      if(!${BASE64_PATTERN.toString()}.test(value)) {
        ${this.makeErrorCode({ type: 'stringBase64', actual: 'origValue', messages })}
      }
    `)
  }

  // if (schema.contains != null && value.indexOf(schema.contains) === -1) {
  //   code.push(`
  //     if (value !== '${schema.equal}') {
  //       ${this.makeErrorCode({ type: 'stringEqual', passed: 'value', expected: `"${schema.equal}"`, messages })}
  //       return value
  //     }
  //   `)
  //   return this.makeError('stringContains', schema.contains, value)
  // }

  code.push(`
    return value
  `)

  return {
    isSanitized,
    code: code.join('\n')
  }
}
