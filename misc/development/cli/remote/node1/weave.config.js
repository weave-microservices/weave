
const RedisTransportAdapter = require('../../../../../packages/transports/redis/lib/index');

module.exports = {
  nodeId: 'weave-js-remote-cli-1',
  transport: {
    adapter: RedisTransportAdapter()
  },
  logger: {
    level: 'debug'
  }
};
