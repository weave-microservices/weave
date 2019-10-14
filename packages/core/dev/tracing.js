const { Weave, TransportAdapters } = require('../lib/index.js')

const broker1 = Weave({
    nodeId: 'node-1',
    namespace: 'metric',
    transport: TransportAdapters.Fake(),
    logger: console,
    logLevel: 'debug',
    preferLocal: false,
    requestTimeout: 4000,
    cache: true,
    tracing: {
        enabled: true,
        tracingRate: 1
    },
    registry: {
        // preferLocal: false
    }
})

broker1.createService({
    name: 'test',
    actions: {
        hello: {
            handler (context) {
                return context.call('test.hello2')
            }
        },
        hello2: {
            handler (context) {
                return context.call('test.hello3', { name: 'test' })
            }
        },
        hello3: {
            cache: {
                keys: ['name']
            },
            params: {
                name: 'string'
            },
            handler (context) {
                return context.call('test.hello4')
            }
        },
        hello4: {
            handler (context) {
                return 'hello'
            }
        }
    },
    events: {
        '$tracing.trace.span.started' (payload) {
            console.log(payload)
            console.log('-----------------------')
        },
        '$tracing.trace.span.finished' (payload) {
            console.log(payload)
            console.log('-----------------------')
        }
    }
})

Promise.all([
    broker1.start()
]).then(() => {
    setInterval(() => {
        broker1.call('test.hello', { name: 'John Doe' })
            .then(result => console.log(result))
    }, 1000)
})
