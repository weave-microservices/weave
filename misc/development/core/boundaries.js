const defineAction = require('@weave-js/core/lib/helper/defineAction');
const { createBroker, TransportAdapters } = require('../../../packages/core/core/lib');
const repl = require('../../../packages/core/repl/lib/index');

const gwBroker = createBroker({
  nodeId: 'gateway',
  transport: {
    adapter: TransportAdapters.Dummy()
  }
});

const workerBroker = createBroker({
  nodeId: 'worker',
  transport: {
    adapter: TransportAdapters.Dummy()
  }
});

workerBroker.createService({
  name: 'greeter',
  actions: {
    sayHello: defineAction({
      params: {
        test: { type: 'boolean' },
        name: { type: 'boolean' },
        email: { type: 'email' },
        settings: {
          type: 'object', props: {
            isActive: { type: 'boolean' }
          }
        },
        age: { type: 'number' }
      },
      visibility: 'private',
      handler (context) {
        context.data;
        return 'hello';
      }
    })
  }
});

workerBroker.createService({
  name: 'user',
  actions: {
    getUsers: {
      visibility: 'private',
      handler (context) {
        return [
          'manfred'
        ];
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
