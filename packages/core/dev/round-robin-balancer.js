const { Weave, TransportAdapters } = require('../lib/index.js')

const broker1 = Weave({
    nodeId: 'node-1',
    transport: TransportAdapters.Fake(),
    logger: console,
    logLevel: 'debug',
    preferLocal: false
})

broker1.createService({
    name: 'test',
    actions: {
        hello () {
            return Promise.resolve('Hello from ' + this.broker.nodeId)
        }
    }
})

// Create broker #2
const broker2 = Weave({
    nodeId: 'node-2',
    transport: TransportAdapters.Fake(),
    logger: console
})

broker2.createService({
    name: 'test',
    actions: {
        hello () {
            return Promise.resolve('Hello from ' + this.broker.nodeId)
        }
    }
})

// Create broker #2
const broker3 = Weave({
    nodeId: 'node-3',
    transport: TransportAdapters.Fake(),
    logger: console
})

broker3.createService({
    name: 'test',
    actions: {
        hello () {
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
        broker1.call('test.hello').then(result => broker1.log.info(result))
    })
})
