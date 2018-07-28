const Weave = require('../lib/index.js')
// Create broker #1
const adapters = require('../adapters')

const broker1 = Weave({
    nodeId: 'node-1',
    transport: adapters.Fake(),
    logger: console,
    logLevel: 'debug',
    preferLocal: false,
    requestTimeout: 4000,
    metrics: {
        enabled: true,
        metricRate: 1
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
                return context.call('test.hello3')
            }
        },
        hello3: {
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
        'metrics.trace.span.started' (payload) {
            console.log(payload)
            console.log('-----------------------')
        },
        'metrics.trace.span.finished' (payload) {
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
    }, 2000)
})
