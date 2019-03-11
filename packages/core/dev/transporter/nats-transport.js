const { Weave } = require('../../lib/index.js')
// Create broker #1

const broker1 = Weave({
    nodeId: 'nats-1',
    transport: {
        adapter: 'nats://localhost:4222'
    },
    logger: console,
    logLevel: 'info',
    cache: true,
    registry: {
        preferLocalActions: false
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
    broker1.start()
]).then(() => {
    setInterval(() => {
        broker1.call('test.hello', { name: 'John Doe' })
            .then(function (result) {
                broker1.log.info(result)
            })
            .catch(e => console.log(e.message))
    }, 1)
})
