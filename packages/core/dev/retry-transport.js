const { Weave, TransportAdapters, Errors } = require('../lib/index.js')
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
                    this.log.debug(context.retryCount)
                    if (context.retryCount > 4) {
                        return resolve(context.retryCount)
                    }
                    return reject(new Errors.WeaveRetrieableError('Oh no!'))
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
        broker2.call('test2.helloTimeout', { name: 'John Doe' })
            .then(result => broker1.log.info(result))
            .catch(error => {
                broker1.log.error(error.message)
            })
    })
