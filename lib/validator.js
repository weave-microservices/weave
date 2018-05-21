/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const ObjectValidator = require('fw-object-validator')
const { WeaveParameterValidationError } = require('../errors')

const makeValidator = ({ use }) => {
    const self = Object.create(null)
    const validator = ObjectValidator()

    use(makeMiddleware())

    self.compile = schema => validator.compile(schema)

    self.validate = (obj, schema) => {
        return validator.validate(obj, schema)
    }

    self.addRule = (type, ruleFn) => validator.addRule(type, ruleFn)

    return self

    function makeMiddleware () {
        return function (handler, action) {
            if (action.params && typeof action.params === 'object') {
                const validate = self.compile(action.params)
                return context => {
                    const result = validate(context.params)
                    if (result === true) {
                        return handler(context)
                    } else {
                        return Promise.reject(new WeaveParameterValidationError('Parameter validation error', null, result))
                    }
                }
            }
            return handler
        }
    }
}

module.exports = makeValidator
