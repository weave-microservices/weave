/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */

const { isPlainObject } = require('@weave-js/utils')
const { buildActionTags, buildEventTags } = require('./tags')

const wrapTracingLocalActionMiddleware = function (handler) {
  const broker = this
  const tracingOptions = broker.options.tracing || {}

  if (tracingOptions.enabled) {
    return function metricsLocalMiddleware (context, serviceInjections) {
      const tags = buildActionTags(context, tracingOptions)

      if (tracingOptions) {
        tags.data = context.data !== null && isPlainObject(context.data) ? Object.assign({}, context.data) : context.data
      }

      const spanName = `action "${context.action.name}"`

      const span = context.startSpan(spanName, {
        id: context.id,
        traceId: context.requestId,
        parentId: context.parentId,
        type: 'action',
        service: context.service,
        tags,
        sampled: context.tracing
      })

      context.span = span

      return handler(context, serviceInjections)
        .then(result => {
          const tags = {
            isCachedResult: context.isCachedResult
          }

          if (tracingOptions) {
            tags.response = result !== null && isPlainObject(result) ? Object.assign({}, result) : result
          }

          span.addTags(tags)
          span.finish()
          return result
        })
        .catch(error => {
          span
            .setError(error)
            .finish()
          return Promise.reject(error)
        })
    }
  }
  return handler
}

const wrapTracingLocalEventMiddleware = function (handler, event) {
  const broker = this
  const service = event.service
  const tracingOptions = broker.options.tracing || {}

  if (tracingOptions.enabled) {
    return function metricsLocalMiddleware (context) {
      const tags = buildEventTags(context)

      const span = context.startSpan(`event "${context.eventName}"`, {
        id: context.id,
        traceId: context.requestId,
        parentId: context.parentId,
        type: 'event',
        service,
        tags,
        sampled: context.tracing
      })

      context.span = span

      return handler(context)
        .then(result => {
          span.finish()
          return result
        })
        .catch(error => {
          span
            .setError(error)
            .finish()
          return Promise.reject(error)
        })
    }
  }
  return handler
}

module.exports = () => {
  return {
    localAction: wrapTracingLocalActionMiddleware,
    localEvent: wrapTracingLocalEventMiddleware
  }
}
