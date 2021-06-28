/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

/**
 * @typedef {import('../types.js').Runtime} Runtime
*/

const ObjectValidator = require('@weave-js/validator')
const { WeaveParameterValidationError } = require('../errors')

/**
 * Init validator and attach it to our runtime object.
 * @param {Runtime} runtime Runtime object.
 * @returns {void}
*/
exports.initValidator = (runtime) => {
  const validator = ObjectValidator()

  Object.defineProperty(runtime, 'validator', {
    value: {
      ...validator,
      middleware: () => {
        return {
          localAction (handler, action) {
            if (action.params && typeof action.params === 'object') {
              const parameterOptions = Object.assign(
                runtime.options.validatorOptions,
                action.validatorOptions
              )

              const validate = validator.compile(action.params, parameterOptions)

              return (context) => {
                let result = validate(context.data)

                if (result === true) {
                  return handler(context)
                } else {
                  // Enriching the validator errors with some usefull information
                  result = result.map(data => Object.assign(data, { nodeId: context.nodeId, action: context.action.name }))
                  return Promise.reject(new WeaveParameterValidationError('Parameter validation error', result))
                }
              }
            }

            return handler
          },
          localEvent (handler, event) {
            if (event.params && typeof event.params === 'object') {
              const parameterOptions = Object.assign(
                runtime.options.validatorOptions,
                event.validatorOptions
              )

              const validate = validator.compile(event.params, parameterOptions)

              return (context) => {
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
      }
    }
  })

  return validator
}
