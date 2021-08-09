/**
 * @typedef {import("../../types.js").Context} Context
*/

/**
 * Build span tags object
 * @param {Context} context - Context
 * @returns {object} Tags
*/
module.exports.buildTags = (context) => {
  return {
    requestLevel: context.level,
    action: context.action ? { name: context.action.name, shortName: context.action.shortName } : null,
    isRemoteCall: !!context.callerNodeId,
    nodeId: context.nodeId
  }
}
