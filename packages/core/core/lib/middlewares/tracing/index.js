/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

const { buildActionTags, buildEventTags, addResponseTags } = require('./tags');

function getSpanName (context, actionTracingOptions) {
  let spanName = `action "${context.action.name}"`;

  try {
    if (actionTracingOptions.spanName) {
      switch (typeof actionTracingOptions.spanName) {
      case 'string':
        spanName = actionTracingOptions.spanName;
        break;
      case 'function':
        spanName = actionTracingOptions.spanName.call(context.service, context);
        break;
      }
    }
  } catch (error) {
    context.service.log.warn({
      requestId: context.requestId,
      spanId: context.span.id
    }, `Error while getting span name: ${error.message}`);
  }

  return spanName;
}

const wrapTracingLocalActionMiddleware = function (handler, action) {
  const broker = this;
  const globalTracingOptions = broker.options.tracing || {};
  const actionTracingOptions = action.tracing || {};

  if (globalTracingOptions.enabled) {
    return function tracingLocalMiddleware (context, serviceInjections) {
      const tags = buildActionTags(context, globalTracingOptions, actionTracingOptions);

      const spanName = getSpanName(context, actionTracingOptions);

      const span = context.startSpan(spanName, {
        id: context.id,
        traceId: context.requestId,
        parentId: context.parentId,
        type: 'action',
        service: context.service,
        tags,
        sampled: context.tracing
      });

      context.tracing = span.sampled;

      return handler(context, serviceInjections)
        .then(result => {
          const tags = {
            isCachedResult: context.isCachedResult
          };

          addResponseTags(context, tags, result, globalTracingOptions.actions, actionTracingOptions);

          span.addTags(tags);
          context.finishSpan(span);
          return result;
        })
        .catch(error => {
          span.setError(error);
          context.finishSpan(span);
          return Promise.reject(error);
        });
    };
  }
  return handler;
};

const wrapTracingLocalEventMiddleware = function (handler, event) {
  const broker = this;
  const service = event.service;
  const tracingOptions = broker.options.tracing || {};
  const eventTracingOptions = event.tracing || {};

  if (tracingOptions.enabled) {
    return function metricsLocalMiddleware (context) {
      const tags = buildEventTags(context, tracingOptions, eventTracingOptions);

      const span = context.startSpan(`event "${context.eventName}"`, {
        id: context.id,
        traceId: context.requestId,
        parentId: context.parentId,
        type: 'event',
        service,
        tags,
        sampled: context.tracing
      });

      context.tracing = span.sampled;

      return handler(context)
        .then(result => {
          context.finishSpan(span);
          return result;
        })
        .catch(error => {
          span.setError(error);
          context.finishSpan(span);
          return Promise.reject(error);
        });
    };
  }
  return handler;
};

module.exports = () => {
  return {
    localAction: wrapTracingLocalActionMiddleware,
    localEvent: wrapTracingLocalEventMiddleware
  };
};
