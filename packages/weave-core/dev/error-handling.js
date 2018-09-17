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
    internalActions: false,
    registry: {
        // preferLocal: false
    }
})

broker1.createService({
    name: 'test',
    actions: {
        hello: {
            params: {
                name: { type: 'string' }
            },
            handler (context) {
                return Promise.reject('asdasdas')
            }
        }
    },
    methods: {
        test () {
            this.log.debug('testmessage')
        }
    }
})
// Create broker #2
const broker2 = Weave({
    nodeId: 'node-2',
    transport: adapters.Fake(),
    logger: console,
    cacher: true,
    internalActions: false,
    registry: {}
})

Promise.all([
    broker1.start(),
    broker2.start()
]).then(() => {
    setInterval(() => {
        broker1.call('test.hello', { name: 'John Doe' })
            .then(function (result) {
                broker1.log.debug(result)
            }).catch(error => {
                broker1.log.warn(error)
            })
    }, 500)
})
