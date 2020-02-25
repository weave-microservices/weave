/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const wrapTracingMiddleware = function (handler) {
  const broker = this
  const options = broker.options.tracing || {}

  if (options.enabled) {
    return function metricsLocalMiddleware (context) {
      const tags = {
        requestLevel: context.level,
        action: context.action ? {
          name: context.action.name,
          shortName: context.action.shortName
        } : null,
        remoteCall: !!context.callerNodeId,
        nodeId: context.nodeId
      }

      const span = context.startSpan(`action '${context.action.name}'`, {
        id: context.id,
        traceId: context.requestId,
        parentId: context.parentId,
        type: 'action',
        service: context.service ? {
          name: context.service.name,
          fullyQualifiedName: context.service.fullyQualifiedName,
          version: context.service.version
        } : null,
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

// const wrapTracingEventMiddleware = function (handler, action) {
//     const broker = this

//     return function metricsRemoteMiddleware (context) {
//         console.log(context.requestId)
//         console.log(context.parentId)
//         return handler(context)
//     }
// }

module.exports = () => {
  return {
    localAction: wrapTracingMiddleware
    // localEvent: wrapTracingEventMiddleware
  }
}
