const { defaultsDeep } = require('@weave-js/utils');
const { Weave } = require('../../src/index');

exports.createNode = (options, services = []) => {
  options = defaultsDeep(options, {
    logger: {
      enabled: false
    }
  });

  const broker = Weave(options, services);
  if (services) {
    services.map(schema => broker.createService(Object.assign({}, schema)));
  }
  return broker;
};
