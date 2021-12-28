/**
 * @typedef {import("../../types.js").Context} Context
 * @typedef {import("../../types.js").TracingOptions} TracingOptions
*/

/**
 * Build span tags object
 * @param {Context} context - Context
 * @param {TracingOptions} tracingOptions - Tracing options
 * @returns {object} Tags
*/
module.exports.buildActionTags = (context, brokerTracingOptions, actionTracingOptions) => {
  const tags = {
    requestLevel: context.level,
    action: context.action ? { name: context.action.name, shortName: context.action.shortName } : null,
    isRemoteCall: !!context.callerNodeId,
    nodeId: context.nodeId,
    requestId: context.requestId
  }

  return tags
}

/**
 * Build span tags object
 * @param {Context} context - Context
 * @param {TracingOptions} tracingOptions - Tracing options
 * @returns {object} Tags
*/
module.exports.buildEventTags = (context, brokerTracingOptions, actionTracingOptions) => {
  const tags = {
    requestLevel: context.level,
    event: context.eventName,
    eventType: context.eventType,
    isRemoteCall: !!context.callerNodeId,
    nodeId: context.nodeId,
    requestId: context.requestId
  }

  return tags
}
