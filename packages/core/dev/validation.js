const { Weave, TransportAdapters } = require('../lib/index.js')

const broker1 = Weave({
    nodeId: 'node-1',
    transport: TransportAdapters.Redis(),
    logger: console,
    logLevel: 'info',
    preferLocal: false,
    loadNodeService: false
})

broker1.createService({
    name: 'test1',
    actions: {
        hello: {
            params: {
                name: { type: 'string', minLength: 3 }
            },
            handler (context) {
                this.log.info(context.level)
                return context.params.name
            }
        }
    }
})

const broker2 = Weave({
    nodeId: 'node-2',
    transport: TransportAdapters.Redis(),
    logger: console,
    logLevel: 'info',
    preferLocal: false,
    loadNodeService: false
})

broker2.createService({
    name: 'test1',
    actions: {
        hello: {
            params: {
                name: { type: 'string', minLength: 5 }
            },
            handler (context) {
                this.log.info(context.level)
                return context.params.name
            }
        }
    }
})

Promise.all([
    broker1.start(),
    broker2.start()
]).then(() => {
    setInterval(() => {
        broker1.log.info('-------------------------')
        broker1.call('test1.hello', { name: 'test' })
            .then(result => broker1.log.info(result))
            .catch(error => {
                broker1.log.info(error.message)
            })
    }, 1000)
})
