const { Weave } = require('../lib/index.js')
// Create broker #1
const broker1 = Weave({
    nodeId: 'node-1',
    logger: console,
    logLevel: 'debug',
    preferLocal: false,
    requestTimeout: 2000,
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

broker1.start()
    .then(() => {
        broker1.call('test.helloTimeout', { name: 'John Doe' })
            .then(result => broker1.log.info(result))
            .catch(error => {
                broker1.log.error(error.message)
            })
    })
