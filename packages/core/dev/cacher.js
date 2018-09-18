const { Weave, TransportAdapters } = require('../lib/index.js')

// Create broker #1

const broker1 = Weave({
    nodeId: 'node-1',
    transport: TransportAdapters.Fake(),
    logger: console,
    logLevel: 'debug',
    preferLocal: false,
    cacher: true,
    registry: {
        // preferLocal: false
    }
})

broker1.createService({
    name: 'test',
    actions: {
        hello: {
            cache: {
                keys: ['name']
            },
            params: {
                name: { type: 'string' }
            },
            handler (context) {
                return 'Hello ' + context.params.name
            }
        }
    },
    events: {
        'cache.clean.*': function (payload) {
            console.log(payload)
        }
    }
})
// Create broker #2
const broker2 = Weave({
    nodeId: 'node-2',
    transport: TransportAdapters.Fake(),
    logger: console,
    cacher: true,
    registry: {
        // preferLocal: false
    }
})

Promise.all([
    broker1.start(),
    broker2.start()
]).then(() => {
    setInterval(() => {
        const p = broker1.call('test.hello', { name: 'John Doe' })
        p.then(result => broker1.log.info(result))
            .catch(error => broker1.log.warn(error))
    }, 500)
})
