module.exports = (broker, registry) => {
  return {
    next (/* endpointList,context*/) {
      broker.handleError(new Error('Method not implemented!'));
    }
  };
};
