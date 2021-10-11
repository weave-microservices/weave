/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */

const { buildTags } = require('./buildTags')

const wrapTracingLocalActionMiddleware = function (handler) {
  const broker = this
  const options = broker.options.tracing || {}

  if (options.enabled) {
    return function metricsLocalMiddleware (context) {
      const tags = buildTags(context)

      const spanName = `action '${context.action.name}'`

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

const wrapTracingLocalEventMiddleware = function (handler, event) {
  const broker = this
  const service = event.service
  const options = broker.options.tracing || {}

  if (options.enabled) {
    return function metricsLocalMiddleware (context) {
      const tags = buildTags(context)

      const span = context.startSpan(`event '${context.eventName}'`, {
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

module.exports = (broker) => {
  return {
    localAction: wrapTracingLocalActionMiddleware,
    localEvent: wrapTracingLocalEventMiddleware
  }
}
