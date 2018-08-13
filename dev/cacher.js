const Weave = require('../lib/index.js')
// Create broker #1
const adapters = require('../adapters')

const broker1 = Weave({
    nodeId: 'node-1',
    transport: adapters.Fake(),
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
                console.log(context.isCachedResult)
                return 'Hello ' + context.params.name
            }
        }
    }
})
// Create broker #2
const broker2 = Weave({
    nodeId: 'node-2',
    transport: adapters.Fake(),
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
        p.then(result => console.log(result))
            .catch(error => console.log(error))
    }, 500)
})
