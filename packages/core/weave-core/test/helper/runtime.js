exports.createFakeRuntime = (options = {}) => {
  return {
    nodeId: options.nodeId,
    options
  }
}
