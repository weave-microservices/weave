const { Weave, TransportAdapters } = require('../lib/index.js')
// Create broker #1
const broker1 = Weave({
    nodeId: 'node-1',
    logger: console,
    logLevel: 'debug',
    preferLocal: false,
    requestTimeout: 2000,
    transport: TransportAdapters.Fake(),
    retryPolicy: {
        enabled: true,
        retries: 5,
        delay: 3000
    },
    registry: {
        // preferLocal: false
    }
})

const broker2 = Weave({
    nodeId: 'node-2',
    logger: console,
    logLevel: 'debug',
    preferLocal: false,
    requestTimeout: 2000,
    transport: TransportAdapters.Fake(),
    retryPolicy: {
        enabled: true,
        retries: 5,
        delay: 3000
    },
    registry: {
        // preferLocal: false
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
            handler (context) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        return resolve('Hello')
                    }, 3000 - (context.retryCount * 500))
                })
            }
        }
    }
})

broker2.createService({
    name: 'test2',
    actions: {
        helloTimeout: {
            cache: {
                keys: ['name']
            },
            params: {
                name: { type: 'string' }
            },
            handler (context) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        return resolve('Hello')
                    }, 3000 - (context.retryCount * 500))
                })
            }
        }
    }
})

Promise.all([
    broker1.start(),
    broker2.start()
])
    .then(() => {
        broker1.call('test2.helloTimeout', { name: 'John Doe' })
            .then(result => broker1.log.info(result))
            .catch(error => {
                broker1.log.error(error.message)
            })
    })
