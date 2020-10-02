/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const errors = require('@weave-js/errors')

class RetrieableError extends Error {
  constructor () {
    super(arguments)
    this.retryable = true
  }
}

module.exports = errors({
  WeaveError: { code: 500 },
  WeaveRetrieableError: { baseClass: RetrieableError },
  WeaveServiceNotFoundError: {}, // retrieable
  WeaveServiceNotAvailableError: {},
  WeaveRequestTimeoutError: {},
  WeaveParameterValidationError: {},
  WeaveBrokerOptionsError: {},
  WeaveQueueSizeExceededError: {}
})
