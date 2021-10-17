
const { createBroker, TransportAdapters } = require('../../../packages/core/core/lib')
const repl = require('../../../packages/core/repl/lib/index')

const broker = createBroker({
  nodeId: '1',
  transport: {
    adapter: TransportAdapters.Dummy()
  }
})

const broker2 = createBroker({
  nodeId: '2',
  transport: {
    adapter: TransportAdapters.Dummy()
  }
})

const broker3 = createBroker({
  nodeId: '3',
  transport: {
    adapter: TransportAdapters.Dummy()
  }
})

broker.createService({
  name: 'test1',
  actions: {
    hello: {
      handler (context) {
        console.log(context.data)
        return {
          name: 'Kevin'
        }
      }
    }
  }
})

broker.createService({
  name: 'test2',
  events: {
    'my-event' (context) {
      this.log.info('hello 1' + context.nodeId)
    }
  }
})

broker.createService({
  name: 'test3',
  events: {
    'my-event' (context) {
      this.log.info('hello 1' + context.nodeId)
    }
  }
})

// broker 2
broker2.createService({
  name: 'test1',
  actions: {
    hello: {
      handler (context) {
        console.log(context.data)
        return {
          name: 'Kevin'
        }
      }
    }
  },
  events: {
    'my-event' (context) {
      this.log.info('hello 2', context.nodeId)
    }
  }
})

broker3.createService({
  name: 'test1',
  actions: {
    hello: {
      handler (context) {
        console.log(context.data)
        return {
          name: 'Kevin'
        }
      }
    }
  },
  events: {
    'my-event' (context) {
      this.log.info('hello 2', context.nodeId)
    }
  }
})

broker2.createService({
  name: 'test2-2',
  events: {
    'my-event' (context) {
      this.log.info('hello 2' + context.nodeId)
    }
  }
})

broker2.createService({
  name: 'test3-2',
  events: {
    'my-event' (context) {
      this.log.info('hello 2' + context.nodeId)
    }
  }
})

Promise.all([
  broker.start(),
  broker2.start(),
  broker3.start()
])
.then(() => repl(broker))
