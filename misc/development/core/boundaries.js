const { createBroker, TransportAdapters } = require('../../../packages/core/core/lib')
const repl = require('../../../packages/core/repl/lib/index')
const { createLockService } = require('../../../packages/services/lock/lib/lock-service')

const gwBroker = createBroker({
  nodeId: 'gateway',
  transport: {
    adapter: TransportAdapters.Dummy()
  }
})

const workerBroker = createBroker({
  nodeId: 'worker',
  transport: {
    adapter: TransportAdapters.Dummy()
  }
})

workerBroker.createService({
  name: 'greeter',
  actions: {
    hello: {
      handler (context) {
        return 'hello'
      }
    }
  }
})

workerBroker.createService({
  name: 'user',
  actions: {
    getUsers: {
      visibility: 'protected',
      handler (context) {
        return [
          'manfred'
        ]
      }
    }
  }
})

Promise.all([
  gwBroker.start(),
  workerBroker.start()
]).then(() => {
  repl(gwBroker)
})
