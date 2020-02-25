const fs = require('fs')
const path = require('path')
const defaultMessages = require('./messages')

function ModelValidator () {
  const rules = {}
  const messages = defaultMessages
  const cache = new Map()

  const internal = {
    makeErrorCode ({ type, expected, field, passed, messages }) {
      const error = {
        type: `'${type}'`,
        message: `'${messages[type]}'`
      }

      if (field) {
        error.field = `'${field}'`
      } else {
        error.field = 'field'
      }

      if (expected) {
        error.expected = expected
      }

      if (passed) {
        error.passed = passed
      }
      const str = Object.keys(error)
        .map(key => `${key}: ${error[key]}`)
        .join(', ')

      return `errors.push({ ${str} })`
    },
    // resolveMessage (error) {
    //     const message = messages[error.type]
    //     if (message) {
    //         return message
    //             .replace('{param}', error.params)
    //             .replace('{expected}', error.expected)
    //     }
    // },
    // check (type, value, schema) {
    //     if (!rules[type]) {
    //         throw new Error(`Invalid type ${type}`)
    //     }
    //     return rules[type].call(this, value, schema)
    // },
    // handleResult (errors, paramPath, result) {
    //     let items
    //     if (Array.isArray(result)) {
    //         items = result
    //     } else {
    //         items = [result]
    //     }

    //     items.forEach(error => {
    //         if (!error.params) {
    //             error.params = paramPath
    //         }

    //         if (!error.message) {
    //             error.message = this.resolveMessage(error)
    //         }

    //         errors.push(error)
    //     })
    // },
    getRuleFromSchema (schema) {
      if (typeof schema === 'string') {
        schema = {
          type: schema
        }
      }

      const ruleGeneratorFunction = rules[schema.type]

      if (!ruleGeneratorFunction) {
        throw new Error(`Invalid type '${schema.type}' in validator schema.`)
      }

      return {
        schema,
        ruleGeneratorFunction,
        messages: Object.assign({}, messages, schema.messages)
      }
    },
    compileRule (rule, context, path, innerSrc, sourceVar) {
      const sourceCode = []

      const item = cache.get(rule.schema)

      if (item) {

      } else {
        rule.index = context.index
        context.rules[context.index] = rule
        context.index++

        const result = rule.ruleGeneratorFunction.call(internal, rule, path, context)

        if (result.code) {
          context.func[rule.index] = new Function('value', 'field', 'parent', 'errors', 'context', result.code)
          sourceCode.push(this.wrapSourceCode(rule, innerSrc.replace('##INDEX##', rule.index), sourceVar))
        } else {
          sourceCode.push(this.wrapSourceCode(rule))
        }
      }

      return sourceCode.join('\n')
    },
    compile (schema) {
      if (typeof schema !== 'object') {
        throw new Error('Invalid Schema!')
      }

      const self = this

      const context = {
        index: 0,
        rules: [],
        func: []
      }

      const code = [
        'const errors = []',
        'let field'
      ]

      // prepare schema
      if (Array.isArray(schema)) {

      } else {
        const tempSchema = Object.assign({}, schema)
        schema = {
          type: 'object',
          props: tempSchema
        }
      }

      const rule = internal.getRuleFromSchema(schema)
      code.push(internal.compileRule(rule, context, null, 'context.func[##INDEX##](value, field, null, errors, context)', 'value'))

      code.push('if (errors.length) {')
      code.push(`
                return errors.map(error => {
                    if (error.message) {
                        error.message = error.message
                            .replace(/\\{param\\}/g, error.field || '')
                            .replace(/\\{expected\\}/g, error.expected != null ? error.expected : '')
                            .replace(/\\{passed\\}/g, error.passed != null ? error.passed : '')
                    }
               
                    return error
                })
            `)
      code.push('}')
      code.push('return true')

      const src = code.join('\n')
      const checkFn = new Function('value', 'context', src)

      return function (data) {
        context.data = data
        // data.id = Number(data.id)
        return checkFn.call(self, data, context)
      }
      // const checks = flatten(Object.keys(schema).map(property => processRule(schema[property], property)))
      // return checkWrapper(checks)
    },
    wrapSourceCode (rule, innerSrc, resolveVar) {
      const code = []
      const defaultValue = rule.schema.default != null ? JSON.stringify(rule.schema.default) : null

      code.push(`
                if (value === undefined || value === null) {
            `)
      if (rule.schema.optional === true) {
        if (defaultValue && resolveVar) {
          code.push(`${resolveVar} = ${defaultValue}`)
        }
      } else {
        if (defaultValue && resolveVar) {
          code.push(`${resolveVar} = ${defaultValue}`)
        } else {
          code.push(this.makeErrorCode({ type: 'required', passed: 'value', messages: rule.messages }))
        }
      }

      code.push('} else {')

      if (innerSrc) {
        code.push(innerSrc)
      }

      code.push('}') // Required, optional

      return code.join('\n')
    }
  }

  fs.readdirSync(path.join(__dirname, 'rules')).forEach(file => {
    const fileName = path.parse(file).name
    rules[fileName] = require(path.join(__dirname, 'rules', file))
  })

  // function processRule (rule, property) {
  //     const checks = []

  //     if (rules[rule.type]) {
  //         checks.push({
  //             name: property,
  //             fn: rules[rule.type],
  //             rule
  //         })
  //     }

  //     if (typeof rule === 'string') {
  //         rule = {
  //             type: rule
  //         }
  //     }

  //     if (rule.type === 'object' && rule.properties) {
  //         checks.push({
  //             name: property,
  //             fn: internal.compile(rule.properties),
  //             rule
  //         })
  //     }
  //     return checks
  // }

  // function checkWrapper (checks) {
  //     return function (object, _schema, path) {
  //         const errors = []

  //         for (let i = 0; i <= checks.length - 1; i++) {
  //             const check = checks[i]
  //             let value
  //             let fieldPath

  //             if (check.name) {
  //                 value = object[check.name]
  //                 fieldPath = (path ? path + '.' : '') + check.name
  //             } else {
  //                 value = object
  //                 fieldPath = path || ''
  //             }

  //             if (value !== undefined) {
  //                 const result = check.fn.call(internal, object[check.name], check.rule)
  //                 if (result !== true) {
  //                     internal.handleResult(errors, fieldPath, result)
  //                 }
  //             } else {
  //                 if (!check.rule.optional) {
  //                     internal.handleResult(errors, fieldPath, internal.makeError('required'))
  //                 }
  //             }
  //         }
  //         return errors.length !== 0 ? errors : true
  //     }
  // }

  return {
    compile: internal.compile,
    validate (obj, schema) {
      const check = this.compile(schema)
      return check(obj)
    },
    addRule (type, ruleFn) {
      if (typeof ruleFn !== 'function') {
        throw new Error('Rule must be a function.')
      }
      rules[type] = ruleFn
    }
  }
}

module.exports = ModelValidator
