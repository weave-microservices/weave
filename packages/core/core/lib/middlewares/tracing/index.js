/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

const { isPlainObject, isFunction, isObject, dotGet } = require('@weave-js/utils');
const { buildActionTags, buildEventTags } = require('./tags');

const wrapTracingLocalActionMiddleware = function (handler, action) {
  const broker = this;
  const tracingOptions = broker.options.tracing || {};
  const actionTracingOptions = action.tracing || {};

  if (tracingOptions.enabled) {
    return function metricsLocalMiddleware (context, serviceInjections) {
      const tags = buildActionTags(context, tracingOptions);

      if (tracingOptions.actions.data) {
        tags.data = context.data !== null && isPlainObject(context.data) ? Object.assign({}, context.data) : context.data;
      }

      const globalActionTags = tracingOptions.actions.tags;
      let actionTags;
      // local action tags take precedence
      if (isFunction(actionTracingOptions.tags)) {
        actionTags = actionTracingOptions.tags;
      } else if (!actionTracingOptions.tags && isFunction(globalActionTags)) {
        actionTags = globalActionTags;
      } else {
        // By default all params are captured. This can be overridden globally and locally
        actionTags = { ...{ data: true }, ...globalActionTags, ...actionTracingOptions.tags };
      }

      if (isObject(actionTracingOptions.tags)) {
        if (Array.isArray(actionTags.data)) {
          tags.data = actionTags.data.reduce((acc, current) => {
            acc[current] = dotGet(context.data, current);
            return acc;
          }, {});
        }
      }

      // Span name
      let spanName = `action "${context.action.name}"`;

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

      const span = context.startSpan(spanName, {
        id: context.id,
        traceId: context.requestId,
        parentId: context.parentId,
        type: 'action',
        service: context.service,
        tags,
        sampled: context.tracing
      });

      context.span = span;

      return handler(context, serviceInjections)
        .then(result => {
          const tags = {
            isCachedResult: context.isCachedResult
          };

          if (tracingOptions.actions.response) {
            tags.response = result !== null && isPlainObject(result) ? Object.assign({}, result) : result;
          }

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

  if (tracingOptions.enabled) {
    return function metricsLocalMiddleware (context) {
      const tags = buildEventTags(context);

      const span = context.startSpan(`event "${context.eventName}"`, {
        id: context.id,
        traceId: context.requestId,
        parentId: context.parentId,
        type: 'event',
        service,
        tags,
        sampled: context.tracing
      });

      context.span = span;

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
