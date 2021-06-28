
// Quick regex to match most common unquoted JavaScript property names. Note the spec allows Unicode letters.
// Unmatched property names will be quoted and validate slighly slower. https://www.ecma-international.org/ecma-262/5.1/#sec-7.6
const identifierRegex = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/

// Regex to escape quoted property names for eval/new Function
const escapeEvalRegex = /[''\\\n\r\u2028\u2029]/g

/* istanbul ignore next */
function escapeEvalString (str) {
  // Based on https://github.com/joliss/js-string-escape
  return str.replace(escapeEvalRegex, character => {
    switch (character) {
    case '\'':
    case '"':
    case '':
    case '\\':
      return '\\' + character
      // Four possible LineTerminator characters need to be escaped:
    case '\n':
      return '\\n'
    case '\r':
      return '\\r'
    case '\u2028':
      return '\\u2028'
    case '\u2029':
      return '\\u2029'
    }
  })
}

module.exports = function checkObject ({ schema, messages }, path, context) {
  const code = []

  // check for type
  code.push(`
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      ${this.makeErrorCode({ type: 'object', passed: 'value', messages })}
      return value;
    }
  `)

  const subSchema = schema.properties || schema.props

  // handle sub schemas
  if (subSchema) {
    code.push('let parentObject = value')
    code.push('let parentField = field')

    const keys = Object.keys(subSchema)
    for (let i = 0; i < keys.length; i++) {
      const property = keys[i]
      const name = escapeEvalString(property)
      const safeSubName = identifierRegex.test(name) ? `.${name}` : `["${name}"]`
      const safePropName = `parentObject${safeSubName}`
      const newPath = (path ? path + '.' : '') + property

      code.push(`\n// Field: ${escapeEvalString(newPath)}`)
      code.push(`field = parentField ? parentField + '${safeSubName}' : '${name}';`)
      code.push(`value = ${safePropName};`)

      const rule = this.getRuleFromSchema(subSchema[property])
      code.push(this.compileRule(rule, context, newPath, `${safePropName} = context.func[##INDEX##](value, field, parentObject, errors, context)`, safePropName))
    }

    if (schema.strict) {
      const allowedProperties = Object.keys(subSchema)

      code.push(`
        field = parentField || '$root'
        const invalidProperties = [];
        const props = Object.keys(parentObject);
        for (let i = 0; i < props.length; i++) {
          if (!${JSON.stringify(allowedProperties)}.includes(props[i])) {
            invalidProperties.push(props[i]);
          }
        }

        if (invalidProperties.length > 0) {
      `)

      if (context.options.strictMode === 'remove') {
        code.push(`
          invalidProperties.forEach((propertyName) => {
            delete parentObject[propertyName]
          })
        `)
      } else {
        code.push(`
          ${this.makeErrorCode({
            type: 'objectStrict',
            expected: `"${allowedProperties.join(', ')}"`,
            passed: 'invalidProperties.join(", ")', messages
          })}
        `)
      }
      code.push('}')
    }

    code.push(`
      return parentObject
    `)
  } else {
    code.push(`
        return value
    `)
  }

  return {
    code: code.join('\n')
  }
}
