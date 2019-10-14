const { Weave, TransportAdapters } = require('../lib/index.js')

// Create broker #1

const broker1 = Weave({
    nodeId: 'node-1',
    transport: TransportAdapters.Fake(),
    // logger: console,
    // logLevel: 'info',
    preferLocal: false,
    cache: true,
    registry: {
        // preferLocal: false
    }
})

broker1.createService({
    name: 'test',
    settings: {
        $dependencyTimeout: 2000
    },
    dependencies: ['math222'],
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
    cache: true,
    registry: {
        // preferLocal: false
    }
})

broker2.start()
broker1.start()
    .catch(error => {
        console.log(error.message)
    })
