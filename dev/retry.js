const Weave = require('../lib/index.js')
const { WeaveRetrieableError } = require('../errors')

// Create broker #1
const broker1 = Weave({
    nodeId: 'node-1',
    logger: console,
    logLevel: 'debug',
    preferLocal: false,
    requestTimeout: 2000,
    registry: {
        // preferLocal: false
    }
})

broker1.createService({
    name: 'test',
    actions: {
        helloTimeouts: {
            cache: {
                keys: ['name']
            },
            params: {
                name: { type: 'string' }
            },
            handler (context) {
                return new Promise((resolve, reject) => {
                    if (context.retryCount < 6) {
                        return reject(new WeaveRetrieableError('ohjeee'))
                    }
                    return resolve('gutt')
                })
            }
        }
    }
})

broker1.start()
    .then(() => {
        broker1.call('test.helloTimeouts', { name: 'John Doe' })
            .then(result => broker1.log.info(result))
    })
