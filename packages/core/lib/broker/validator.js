/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const ObjectValidator = require('@weave-js/validator')
const { WeaveParameterValidationError } = require('../errors')

const createValidator = () => {
  const objectValidator = ObjectValidator()

  const validator = {
    compile: schema => objectValidator.compile(schema),
    validate: (obj, schema) => objectValidator.validate(obj, schema),
    addRule: (type, ruleFn) => objectValidator.addRule(type, ruleFn)
  }

  validator.middleware = function (handler, action) {
    if (action.params && typeof action.params === 'object') {
      const validate = validator.compile(action.params)
      return context => {
        let result = validate(context.params)
        if (result === true) {
          return handler(context)
        } else {
          result = result.map(data => Object.assign(data, { nodeId: context.nodeId, action: context.action.name }))
          return Promise.reject(new WeaveParameterValidationError('Parameter validation error', result))
        }
      }
    }
    return handler
  }

  return validator
}

module.exports = createValidator
