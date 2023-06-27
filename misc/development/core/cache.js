const { createBroker, TransportAdapters, CacheAdapters } = require('../../../packages/core/core/lib');
const repl = require('../../../packages/core/repl/lib/index');

const gwBroker = createBroker({
  nodeId: 'gateway',
  transport: {
    adapter: TransportAdapters.Dummy()
  }
});

const workerBroker = createBroker({
  nodeId: 'worker',
  logger: {
    level: 'debug'
  },
  cache: {
    enabled: true,
    adapter: CacheAdapters.createInMemoryCache()
  },
  transport: {
    adapter: TransportAdapters.Dummy()
  }
});

workerBroker.createService({
  name: 'greeter',
  actions: {
    hello: {
      cache: {
        keys: [':user.id']
      },
      handler (context) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve('hello' + context.meta.user.id);
          }, 500);
        });
      }
    }
  }
});

workerBroker.createService({
  name: 'user',
  actions: {
    getUsers: {
      handler (context) {
        return context.call('greeter.hello', null, { meta: {
          user: {
            id: '123'
          }
        }});
      }
    }
  }
});

Promise.all([
  gwBroker.start(),
  workerBroker.start()
]).then(() => {
  repl(gwBroker);
});
