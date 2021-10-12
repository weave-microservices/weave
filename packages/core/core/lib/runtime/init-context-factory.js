/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */
'use strict'

const { createContext } = require('../broker/context')

/**
 * @typedef {import('../types').Runtime} Runtime
 * @typedef {import('../types').Context} Context
 * @typedef {import('../types').Endpoint} Endpoint
 * @typedef {import('../types').ActionOptions} ActionOptions
*/

/**
 * Init context factory.
 * @param {Runtime} runtime - Runtime reference
 * @returns {void}
*/
exports.initContextFactory = (runtime) => {
  Object.defineProperty(runtime, 'contextFactory', {
    value: {
      /**
       * Creates a new context
       * @param {Endpoint} endpoint - Endpoint
       * @param {any} data - Data
       * @param {ActionOptions} opts Options
       * @returns {Context} Context
      */
      create (endpoint, data, opts) {
        const context = createContext(runtime)

        opts = opts || {}
        context.setData(data)
        // context.timeout = opts.timeout || 0
        context.retryCount = opts.retryCount
        context.options = opts

        // get external request id from options
        if (opts.requestId) {
          context.requestId = opts.requestId
        } else if (opts.parentContext && opts.parentContext.requestId) {
          context.requestId = opts.parentContext.requestId
        }

        // meta data
        if (opts.parentContext && opts.parentContext.meta !== null) {
          context.meta = Object.assign({}, opts.parentContext.meta, opts.meta)
        } else if (opts.meta) {
          context.meta = opts.meta
        }

        // Parent context
        if (opts.parentContext != null) {
          context.parentId = opts.parentContext.id
          context.level = opts.parentContext.level + 1
          context.tracing = opts.parentContext.tracing
          context.span = opts.parentContext.span
        }

        // handle local streams
        if (opts.stream) {
          context.setStream(opts.stream)
        }

        // set request ID for metrics
        if (context.metrics || context.nodeId !== runtime.nodeId) {
          if (!context.requestId) {
            context.requestId = context.id
          }
        }

        if (endpoint) {
          context.setEndpoint(endpoint)
        }

        return context
      }
    }
  })
}
