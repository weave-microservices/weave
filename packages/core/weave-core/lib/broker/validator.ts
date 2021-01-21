/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const ObjectValidator = require('@weave-js/validator')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'WeaveParam... Remove this comment to see the full error message
const { WeaveParameterValidationError } = require('../errors')

exports.createValidator = () => {
  const validator = ObjectValidator()

  // attach the middleware to object validator
  validator.middleware = {
    localAction (handler, action) {
      if (action.params && typeof action.params === 'object') {
        const validate = validator.compile(action.params)

        return context => {
          let result = validate(context.data)

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
  }

  return validator
}
