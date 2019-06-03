const { Weave } = require('../lib')

const broker1 = Weave({
    nodeId: 'node-1',
    // transport: TransportAdapters.Redis(),
    cache: true,
    logger: {
        logLevel: 'debug'
    }
})

broker1.createService({
    name: 'test1',
    actions: {
        hello: {
            cache: {
                keys: ['name']
            },
            handler (context) {
                this.log.info(context.level)
                context.emit('testes')
                return context.call('$node.actions')
            }
        }
    }
})

Promise.all([
    broker1.start()
]).then(() => {
    setInterval(() => {
        broker1.log.info('-------------------------')
        broker1.call('test1.hello').then(result => broker1.log.info(result))
    }, 1000)
})
