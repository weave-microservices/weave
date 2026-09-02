
const { createBroker, TransportAdapters } = require('../../../packages/core/core/lib');
const RedisTransport = require('../../../packages/transports/redis');
const repl = require('../../../packages/core/repl/lib/index');
const payloadOfSize = (bytes) => 'x'.repeat(bytes)

const broker = createBroker({
  nodeId: '1',
  logger: {
    level: 'debug'
  },
  transport: {
    adapter: RedisTransport(),

  }
});

const broker2 = createBroker({
  nodeId: '2',
  logger: {
    level: 'debug'
  },
  transport: {
    adapter: RedisTransport()
  }
});

const broker3 = createBroker({
  nodeId: '3',
  logger: {
    level: 'debug'
  },
  transport: {
    adapter: RedisTransport()
  }
});

broker.createService({
  name: 'test1',
  actions: {
    hello: {
      handler() {
        return {
          name: 'Kevin'
        };
      }
    }
  }
});

broker.createService({
  name: 'test2',
  events: {
    'my-event' (context) {
      this.log.info('hello 1' + context.nodeId);
    }
  }
});

broker.createService({
  name: 'test3',
  events: {
    'my-event' (context) {
      this.log.info('hello 1' + context.nodeId);
    }
  }
});

broker2.createService({
  name: 'test2-2',
  events: {
    'my-event' (context) {
      this.log.info('hello 2' + context.nodeId);
    }
  },
  actions: {
    sizeTest: {
      handler(context) {
        return payloadOfSize(3*1024*1024)
      }
    }
  }
});

broker2.createService({
  name: 'test3-2',
  events: {
    'my-event' (context) {
      this.log.info('hello 2' + context.nodeId);
    }
  }
});

Promise.all([
  broker.start(),
  broker2.start(),
  broker3.start()
])
  .then(() => repl(broker));
