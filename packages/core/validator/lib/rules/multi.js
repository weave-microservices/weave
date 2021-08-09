
/* Signature: function(value, field, parent, errors, context) */
module.exports = function checkDate ({ schema }, path, context) {
  const code = []

  code.push(`
		let previousErrorLength = errors.length
		let errorBefore = 0
		let hasValid = false
    let newValue = value
	`)

  for (let i = 0; i < schema.rules.length; i++) {
    code.push(`
      if (!hasValid) {
        errorBefore = errors.length
    `)

    const rule = this.getRuleFromSchema(schema.rules[i])
    code.push(this.compileRule(rule, context, path, 'var tempValue = context.func[##INDEX##](value, field, parent, errors, context)', 'tempValue'))

    code.push(`
        if (errors.length === errorBefore) {
          hasValid = true
          newValue = tempValue
        }
      }
    `)
  }

  code.push(`
    if (hasValid) {
      errors.length = previousErrorLength
    }
    return newValue
  `)

  return {
    code: code.join('\n')
  }
}
