const { WeaveError } = require('../../errors');

module.exports = (options) => {
  const cache = {};

  cache.init = (registry) => {
    Promise.resolve(new WeaveError('Init method not implemented'));
  };

  cache.stop = (registry) => {
    Promise.resolve(new WeaveError('Stop method not implemented'));
  };

  return cache;
};
