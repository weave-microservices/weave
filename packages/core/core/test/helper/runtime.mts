export const createFakeRuntime = (options = {}) => {
  return {
    nodeId: options.nodeId,
    options,
    tracer: {
      options: options.tracing || {},
    },
  };
};
