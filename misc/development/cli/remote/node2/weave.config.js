
const RedisTransportAdapter = require('../../../../../packages/transports/redis/lib/index');

module.exports = {
  nodeId: 'weave-js-remote-cli-2',
  transport: {
    adapter: RedisTransportAdapter()
  },
  logger: {
    level: 'debug'
  }
};
