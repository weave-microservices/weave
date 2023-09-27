const { createFakeRuntime } = require('./runtime');

exports.createMockRegistry = (options = { runtimeOptions: {}}) => {
  const runtime = createFakeRuntime(options.runtimeOptions);

  return {
    runtime
  };
};

