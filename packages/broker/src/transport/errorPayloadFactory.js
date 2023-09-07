const errorPayloadFactory =
  (runtime) =>
    (error) => {
      return {
        name: error.name,
        message: error.message,
        nodeId: error.nodeId || runtime.nodeId,
        code: error.code,
        stack: error.stack,
        data: error.data
      };
    };

module.exports = { errorPayloadFactory };
