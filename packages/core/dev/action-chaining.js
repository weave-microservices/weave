const { Weave, TransportAdapters } = require('../lib/index.js')

const broker1 = Weave({
    nodeId: 'node-1',
    namespace: 'ciris',
    transport: TransportAdapters.Redis(),
    logger: console,
    logLevel: 'debug',
    preferLocal: false,
    metrics: {
        enabled: true
    }
})

broker1.createService({
    name: 'test1',
    actions: {
        hello (context) {
            this.log.info(context.level)
            return context.call('test2.hello')
        }
    }
})

// Create broker #2
const broker2 = Weave({
    nodeId: 'node-2',
    namespace: 'ciris',
    transport: TransportAdapters.Redis(),
    logger: console,
    metrics: {
        enabled: true
    }
})

broker2.createService({
    name: 'test2',
    actions: {
        hello (context) {
            this.log.info(context.level)
            return context.call('test3.hello')
        }
    }
})

// Create broker #3
const broker3 = Weave({
    nodeId: 'node-3',
    namespace: 'ciris',
    transport: TransportAdapters.Redis(),
    logger: console,
    metrics: {
        enabled: true
    }
})

broker3.createService({
    name: 'test3',
    actions: {
        hello (context) {
            this.log.info(context.level)
            return Promise.resolve('Hello from ' + this.broker.nodeId)
        }
    }
})

Promise.all([
    broker1.start(),
    broker2.start(),
    broker3.start()
]).then(() => {
    setInterval(() => {
        broker1.log.info('-------------------------')
        broker1.call('test1.hello').then(result => broker1.log.info(result))
    }, 1000)
})
