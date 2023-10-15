/**
 * @typedef {import("../../types.js").Context} Context
 * @typedef {import("../../types.js").TracingOptions} TracingOptions
*/

const { isFunction, dotGet, isObject } = require('@weave-js/utils');

function addPreHandleTagsFromDefinition (context, tags, globalTracingActionOptions, actionTracingOptions) {
  const globalActionTags = globalTracingActionOptions.tags;
  let actionTags;
  if (isFunction(actionTracingOptions.tags)) {
    actionTags = actionTracingOptions.tags;
  } else if (!actionTracingOptions.tags && isFunction(globalActionTags)) {
    actionTags = globalActionTags;
  } else {
    actionTags = { data: globalTracingActionOptions.data, ...globalActionTags, ...actionTracingOptions.tags };
  }

  if (isObject(actionTags)) {
    if (actionTags.data === true) {
      tags.data = context.data !== null && isObject(context.data) ? Object.assign({}, context.data) : context.data;
    } else if (Array.isArray(actionTags.data)) {
      tags.data = actionTags.data.reduce((acc, current) => {
        try {
          acc[current] = dotGet(context.data, current);
        } catch (error) {
          const spanId = context.span ? context.span.id : undefined;

          context.service.log.warn({
            requestId: context.requestId,
            spanId
          }, `Unable to get value for tag "${current}" from data`);
          acc[current] = undefined;
        }
        return acc;
      }, {});
    }

    if (actionTags.meta === true) {
      tags.meta = context.meta !== null && isObject(context.meta) ? Object.assign({}, context.meta) : context.meta;
    } else if (Array.isArray(actionTags.meta)) {
      tags.meta = actionTags.meta.reduce((acc, current) => {
        try {
          acc[current] = dotGet(context.meta, current);
        } catch (error) {
          const spanId = context.span ? context.span.id : undefined;

          context.service.log.warn({
            requestId: context.requestId,
            spanId
          }, `Unable to get value for tag "${current}" from metadata`);
          acc[current] = undefined;
        }
        return acc;
      }, {});
    }
  } else if (isFunction(actionTags)) {
    tags.data = actionTags.call(context.service, context);
  }
}

/**
 * Build span tags object
 * @param {Context} context - Context
 * @returns {object} Tags
*/
module.exports.buildActionTags = (context, globalTracingOptions, actionTracingOptions) => {
  const tags = {
    requestLevel: context.level,
    action: context.action ? { name: context.action.name, shortName: context.action.shortName } : null,
    isRemoteCall: !!context.callerNodeId,
    nodeId: context.nodeId,
    requestId: context.requestId
  };

  try {
    addPreHandleTagsFromDefinition(context, tags, globalTracingOptions.actions, actionTracingOptions);
  } catch (error) {
    const spanId = context.span ? context.span.id : undefined;

    context.service.log.warn({
      requestId: context.requestId,
      spanId
    }, `Error while building action tags: ${error.message}`);
  }

  return tags;
};

/**
 * Build span tags object
 * @param {Context} context - Context
 * @returns {object} Tags
*/
module.exports.buildEventTags = (context, globalTracingOptions, eventTracingOptions) => {
  const tags = {
    requestLevel: context.level,
    event: context.eventName,
    eventType: context.eventType,
    isRemoteCall: !!context.callerNodeId,
    nodeId: context.nodeId,
    requestId: context.requestId
  };

  try {
    addPreHandleTagsFromDefinition(context, tags, globalTracingOptions.events, eventTracingOptions);
  } catch (error) {
    const spanId = context.span ? context.span.id : undefined;

    context.service.log.warn({
      requestId: context.requestId,
      spanId
    }, `Error while building event tags: ${error.message}`);
  }

  return tags;
};

module.exports.addResponseTags = (context, tags, result, globalTracingActionOptions, actionTracingOptions) => {
  const globalActionTags = globalTracingActionOptions.tags;
  const actionTags = { response: globalTracingActionOptions.response, ...globalActionTags, ...actionTracingOptions.tags };

  if (actionTags.response === true) {
    tags.response = result !== null && isObject(result) ? Object.assign({}, result) : result;
  } else if (Array.isArray(actionTags.response)) {
    tags.response = actionTags.response.reduce((acc, current) => {
      try {
        acc[current] = dotGet(result, current);
      } catch (error) {
        const spanId = context.span ? context.span.id : undefined;

        context.service.log.warn({
          requestId: context.requestId,
          spanId
        }, `Unable to get response tag "${current}" from result`);
        acc[current] = undefined;
      }
      return acc;
    }, {});
  }
};
