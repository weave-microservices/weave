const { Weave } = require('../lib/index.js')
// Create broker #1

const broker1 = Weave({
    nodeId: 'node-1',
    transport: 'redis',
    logger: console,
    logLevel: 'debug',
    preferLocal: false,
    cache: true,
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
    hooks: {
        before: {
            'hello': [
                function (context, result) {
                    // return Promise.resolve(result)
                    this.log.debug('testmessage')
                    this.log.debug('before1')
                },
                function (context, result) {
                    // return Promise.resolve(result)
                    this.log.debug('before2')
                },
                'test'
            ]
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
    transport: 'redis',
    logLevel: 'debug',
    cache: true,
    registry: {
        // preferLocal: false
    }
})

Promise.all([
    broker1.start(),
    broker2.start()
]).then(() => {
    setInterval(() => {
        // broker2.call('test.hello', { name: 'John Doe' })
        //     .then(function (result) {
        //         // broker1.log.debug(result)
        //     })
    }, 500)
})
