const Weave = require('../lib/index.js')
const adapters = require('../adapters')

const broker1 = Weave({
    nodeId: 'node-1',
    transport: adapters.Fake(),
    logger: console,
    logLevel: 'debug',
    preferLocal: false
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
    transport: adapters.Fake(),
    logger: console
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
    transport: adapters.Fake(),
    logger: console
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


// function createBroker (index) {
//     const broker = Weave({
//         nodeId: 'node-3',
//         transport: adapters.Fake(),
//         logger: console
//     })
    
//     broker.createService({
//         name: 'test',
//         actions: {
//             hello (context) {
//                 this.log.info(context.level)
//                 return Promise.resolve('Hello from ' + this.broker.nodeId)
//             }
//         }
//     })
// }
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
