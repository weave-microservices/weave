/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */

const { WeaveParameterValidationError } = require('../../errors')
const { capitalize } = require('@weave-js/utils')

/**
 * @typedef {import('../../types').Runtime} Runtime
 * @typedef {import('../../types').Middleware} Middleware
**/

/**
 * Create validator middleware
 * @param {Runtime} runtime - Runtime reference
 * @returns {Middleware} - Validator middleware
 */
module.exports = (runtime) => {
  const validator = runtime.validator

  const processErrors = (context, type, results) => {
    const errors = results.map(data => Object.assign(data, { nodeId: context.nodeId, action: context.action.name }))
    return Promise.reject(new WeaveParameterValidationError(`${capitalize(type)} parameter validation error`, errors))
  }

  return {
    localAction (handler, action) {
      const parameterOptions = Object.assign(
        runtime.options.validatorOptions,
        action.validatorOptions
      )

      // validate request schema
      let validateRequestSchema
      let validateResponseSchema
      if (action.params && typeof action.params === 'object') {
        validateRequestSchema = validator.compile(action.params, parameterOptions)
      }

      if (action.responseSchema && typeof action.responseSchema === 'object') {
        validateResponseSchema = validator.compile(action.responseSchema, parameterOptions)
      }

      if (!validateRequestSchema && !validateRequestSchema) {
        return handler
      }

      return (context) => {
        const requestSchemaResult = validateRequestSchema ? validateRequestSchema(context.data) : true

        if (requestSchemaResult === true) {
          return handler(context)
            .then((result) => {
              if (validateResponseSchema) {
                const responseSchemaResult = validateResponseSchema(result)
                if (responseSchemaResult === true) {
                  return result
                }
                return processErrors(context, 'response', responseSchemaResult)
              }
              return result
            })
        } else {
          // Enriching the validator errors with some useful information
          return processErrors(context, 'request', requestSchemaResult)
        }
      }
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
            result = result.map(data => Object.assign(data, { nodeId: context.nodeId, event: context.eventName }))
            return Promise.reject(new WeaveParameterValidationError('Parameter validation error', result))
          }
        }
      }
      return handler
    }
  }
}
