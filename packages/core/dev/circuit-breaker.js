const { Weave, TransportAdapters } = require('../lib/index.js')

// Create broker #1
const broker1 = Weave({
    nodeId: 'node-1',
    transport: TransportAdapters.Fake(),
    logger: console,
    logLevel: 'debug',
    preferLocal: false,
    requestTimeout: 2000,
    circuitBreaker: {
        enabled: true
    }
})

broker1.createService({
    name: 'test',
    actions: {
        helloTimeout: {
            cache: {
                keys: ['name']
            },
            params: {
                name: { type: 'string' }
            },
            async handler (context) {
                return Promise.reject(new Error('sadasdasd'))
            }
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
        helloTimeout: {
            cache: {
                keys: ['name']
            },
            params: {
                name: { type: 'string' }
            },
            handler (context) {
                return Promise.resolve('hello')
            }
        }
    }
})

Promise.all([
    broker1.start(),
    broker2.start()
]).then(() => {
    setInterval(() => {
        broker1.log.info('-------------------------')
        broker1.call('test.helloTimeout', { name: 'John Doe' })
            .then(result => broker1.log.info(result))
            .catch(error => {
                broker1.log.error(error.message)
            })
    }, 2000)
})
