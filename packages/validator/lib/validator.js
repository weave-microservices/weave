const fs = require('fs')
const path = require('path')
const defaultMessages = require('./messages')

function ModelValidator () {
    const rules = {}
    const messages = defaultMessages
    const cache = new Map()

    const internal = {
        makeErrorCode ({ type, expected, field, origin, messages }) {
            const error = {
                type: `'${type}'`,
                message: `'${messages[type]}'`
            }

            if (field) {
                error.field = `"${field}"`
            } else {
                error.field = 'field'
            }

            if (expected) {
                error.expected = expected
            }

            if (origin) {
                error.origin = origin
            }
            const str = Object.keys(error)
                .map(key => `${key}: ${error[key]}`)
                .join(', ')

            return `errors.push({ ${str} })`
        },
        resolveMessage (error) {
            const message = messages[error.type]
            if (message) {
                return message
                    .replace('{param}', error.params)
                    .replace('{expected}', error.expected)
            }
        },
        check (type, value, schema) {
            if (!rules[type]) {
                throw new Error(`Invalid type ${type}`)
            }
            return rules[type].call(this, value, schema)
        },
        handleResult (errors, paramPath, result) {
            let items
            if (Array.isArray(result)) {
                items = result
            } else {
                items = [result]
            }

            items.forEach(error => {
                if (!error.params) {
                    error.params = paramPath
                }

                if (!error.message) {
                    error.message = this.resolveMessage(error)
                }

                errors.push(error)
            })
        },
        getRuleFromSchema (schema) {
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
        compileRule (rule, context, path, innerSrc, defaultValue) {
            const sourceCode = []

            const item = cache.get(rule.schema)

            if (item) {

            } else {
                rule.index = context.index
                context.rules[context.index] = rule
                context.index++

                const result = rule.ruleGeneratorFunction.call(internal, rule, path, context)

                if (result.code) {
                    const fn = new Function('value', 'field', 'parent', 'errors', 'context', result.code);
                    context.func[rule.index] = fn
                    sourceCode.push(this.wrapSourceCode(rule, innerSrc.replace('##INDEX##', rule.index)))
                } else {
                    console.log(result)
                }
            }
            return sourceCode.join('\n')
        },
        compile (schema) {
            if (typeof schema !== 'object') {
                throw new Error('Invalid Schema!')
            }

            const context = {
                index: 0,
                rules: [],
                func: [],
                customs: {}
            }

            const code = [
                'let errors = []',
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
                            .replace(/\\{param\\}/g, error.field || "")
                            .replace(/\\{expected\\}/g, error.expected != null ? error.expected : "")
                            .replace(/\\{actual\\}/g, error.actual != null ? error.actual : "")
                    }
               
                    return error
                })
            `)
            code.push('}')
            code.push('return true')

            const src = code.join('\n')
            const checkFn = new Function('value', 'context', src)

            return (data) => {
                context.data = data
                return checkFn(data, context)
            }
        },
        wrapSourceCode (rule, innerSrc, resolveVar) {
            const code = []

            if (innerSrc) {
                code.push(innerSrc)
            }

            return code.join('\n')
        }
    }

    fs.readdirSync(path.join(__dirname, 'rules')).forEach(file => {
        const fileName = path.parse(file).name
        rules[fileName] = require(path.join(__dirname, 'rules', file))
    })

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
