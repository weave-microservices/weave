const fs = require('fs')
const path = require('path')
const { flatten } = require('lodash')
const defaultMessages = require('./messages')

function ModelValidator () {
    const rules = {}
    const messages = defaultMessages

    const internal = {
        makeError (type, expected, given, isMissing = false) {
            return {
                type,
                expected,
                given,
                isMissing
            }
        },
        resolveMessage (error) {
            const message = messages[error.type]
            if (message) {
                return message.replace('{param}', error.params).replace('{expected}', error.expected)
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
        compile (schema) {
            if (typeof schema !== 'object') {
                throw new Error('Invalid Schema!')
            }
            const checks = flatten(Object.keys(schema).map(property => processRule(schema[property], property)))
            return checkWrapper(checks)
        }
    }

    fs.readdirSync(path.join(__dirname, 'rules')).forEach(file => {
        const fileName = path.parse(file).name
        rules[fileName] = require(path.join(__dirname, 'rules', file))
    })

    function processRule (rule, property) {
        const checks = []

        if (rules[rule.type]) {
            checks.push({
                name: property,
                fn: rules[rule.type],
                rule
            })
        }

        if (typeof rule === 'string') {
            rule = {
                type: rule
            }
        }

        if (rule.type === 'object' && rule.properties) {
            checks.push({
                name: property,
                fn: internal.compile(rule.properties),
                rule
            })
        }
        return checks
    }

    function checkWrapper (checks) {
        return function (object, _schema, path) {
            const errors = []
            for (let i = 0; i <= checks.length - 1; i++) {
                const check = checks[i]
                let value
                let fieldPath

                if (check.name) {
                    value = object[check.name]
                    fieldPath = (path ? path + '.' : '') + check.name
                } else {
                    value = object
                    fieldPath = path || ''
                }
                if (value !== undefined) {
                    const result = check.fn.call(internal, object[check.name], check.rule)
                    if (result !== true) {
                        internal.handleResult(errors, fieldPath, result)
                    }
                } else {
                    if (!check.rule.optional) {
                        internal.handleResult(errors, fieldPath, internal.makeError('required'))
                    }
                }
            }
            return errors.length !== 0 ? errors : true
        }
    }

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
