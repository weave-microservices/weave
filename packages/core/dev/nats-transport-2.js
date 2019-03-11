const { Weave } = require('../lib/index.js')
// Create broker #1

const broker1 = Weave({
    nodeId: 'nats-1-2',
    transport: {
        adapter: 'nats://localhost:4222'
    },
    logger: console,
    logLevel: 'info',
    preferLocal: false,
    cache: true,
    registry: {
        preferLocal: false
    }
})

const broker2 = Weave({
    nodeId: 'nats-2-2',
    transport: {
        adapter: {
            type: 'nats',
            options: {
            }
        }
    },
    logger: console,
    logLevel: 'info',
    preferLocal: false,
    cache: true,
    registry: {
        preferLocal: false
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
                return 'Hello ' + context.params.name + ' from node ' + this.broker.nodeId
            }
        }
    },
    events: {
        '$node.connected' (data) {
            console.log(data)
        }
    },
    hooks: {
        before: {
            'hello': [
                function (context, result) {
                    this.log.debug('testmessage')
                    this.log.debug('before1')
                },
                function (context, result) {
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

Promise.all([
    broker1.start(),
    broker2.start()
]).then(() => {
    // setInterval(() => {
    //     broker1.call('test.hello', { name: 'John Doe' })
    //         .then(function (result) {
    //             broker1.log.info(result)
    //         })
    // }, 2000)
    setInterval(() => {
        broker1.log.info(`Statistics: `, broker1.transport.statistics)
    }, 3000)
})
