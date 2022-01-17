const defaultMessages = require('./messages')
/**
 * @typedef {Object} ValidationOptions Validation options
 * @property {boolean} [strict] Enables strict mode.
 * @property {'remove'|'error'} [strictMode] Set strict mode.
 * @property {boolean} [root=false] Validate a root value.
 */
/**
 * Compile a schema to validation function.
 * @param {any} schema Validation schema
 * @param {ValidationOptions} [options] Validation options
 * @returns {ValidationFunction} Validation function
*/

/**
 * ModelValidator
 * @typedef {Object} ModelValidator
 * @property {function(any, ValidationOptions):ValidationFunction} compile Compile validation schema and return an validation function.
 * @property {function(any, object):void} validate Validate
 * @property {function(string, function):void} addRule Add custom validation rule
 *
 * @returns
 */

/**
 * @callback ValidationFunction
 * @property {any} Validation object
 * @returns {boolean|Array<Object>}
 */

/**
 * Create model validator
 * @returns {ModelValidator} Model validator
*/
function ModelValidator () {
  const messages = defaultMessages
  const cache = new Map()

  // Load rules
  const rules = {
    any: require('./rules/any'),
    array: require('./rules/array'),
    boolean: require('./rules/boolean'),
    date: require('./rules/date'),
    email: require('./rules/email'),
    enum: require('./rules/enum'),
    forbidden: require('./rules/forbidden'),
    multi: require('./rules/multi'),
    number: require('./rules/number'),
    object: require('./rules/object'),
    string: require('./rules/string'),
    url: require('./rules/url')
  }

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

      // Error object to string
      const str = Object.keys(error)
        .map(key => `${key}: ${error[key]}`)
        .join(', ')

      // Push error object content to errors
      return `errors.push({ ${str} })`
    },
    getRuleFromSchema (schema) {
      if (typeof schema === 'string') {
        schema = {
          type: schema
        }
      } else if (Array.isArray(schema)) {
        if (schema.length === 0) {
          throw new Error('Invalid schema.')
        }

        schema = {
          type: 'multi',
          rules: schema
        }

        // todo: handle optionals
        schema.optional = schema.rules
          .map(s => internal.getRuleFromSchema(s))
          .every(r => r.schema.optional === true)
      }

      if (!schema.type) {
        throw new Error('Property type is missing.')
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

      if (rule.schema.type === 'object') {
        rule.schema.strict = !!context.options.strict
      }

      const item = cache.get(rule.schema)

      if (item) {

      } else {
        rule.index = context.index
        context.rules[context.index] = rule
        context.index++

        const result = rule.ruleGeneratorFunction.call(internal, rule, path, context)

        if (result.code) {
          context.func[rule.index] = new Function('value', 'field', 'parent', 'errors', 'context', result.code)
          sourceCode.push(this.wrapSourceCode(rule, context, innerSrc.replace('##INDEX##', rule.index), sourceVar))
        } else {
          sourceCode.push(this.wrapSourceCode(rule, context))
        }
      }

      return sourceCode.join('\n')
    },
    compile (schema, options = {}) {
      options = Object.assign({
        strict: true,
        strictMode: 'remove',
        root: false
      }, options)

      if (typeof schema !== 'object') {
        throw new Error('Invalid Schema.')
      }

      const self = this

      // define
      const context = {
        index: 0,
        rules: [],
        func: [],
        options: {
          ...options
        }
      }

      cache.clear()

      const code = [
        'const errors = []',
        'let field'
      ]

      // prepare schema
      if (options.root !== true) {
        // Root validator is an array (Multiple types)
        if (Array.isArray(schema)) {
          const rule = internal.getRuleFromSchema(schema)
          schema = rule.schema
        } else {
          const tempSchema = Object.assign({}, schema)
          schema = {
            type: 'object',
            strict: context.options.strict || false,
            props: tempSchema
          }
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
        return checkFn.call(self, data, context)
      }
    },
    wrapSourceCode (rule, context, innerSrc, resolveVar) {
      const code = []
      let handleValue = ''
      let skipUndefinedValue = rule.schema.optional === true || rule.schema.type === 'forbidden'
      const skipNullValue = rule.schema.optional === true || rule.schema.nullable === true || rule.schema.type === 'forbidden'

      if (rule.schema.default != null) {
        let defaultValue
        skipUndefinedValue = false

        // handle dynamic default value
        if (typeof rule.schema.default === 'function') {

        } else {
          defaultValue = JSON.stringify(rule.schema.default)
        }

        handleValue = `
          value = ${defaultValue}
          ${resolveVar} = value
        `
      } else {
        handleValue = this.makeErrorCode({ type: 'required', passed: 'value', messages: rule.messages })
      }
      code.push(`
        ${`if (value === undefined) { ${skipUndefinedValue ? '\n // allow undefined value\n' : handleValue} }`}
        ${`else if (value === null) {  ${skipNullValue ? '\n // allow null value\n' : handleValue} }`}
        ${innerSrc ? `else { ${innerSrc} }` : ''}
      `)

      return code.join('\n')
    }
  }

  return {
    compile: internal.compile,
    validate (obj, schema) {
      const check = internal.compile(schema)
      return check(obj)
    },
    addRule (typeName, ruleFn) {
      if (typeof ruleFn !== 'function') {
        throw new Error('Rule must be a function.')
      }
      rules[typeName] = ruleFn
    }
  }
}

module.exports = ModelValidator
