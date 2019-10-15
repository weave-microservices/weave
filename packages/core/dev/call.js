const { Weave } = require('../lib')

const broker1 = Weave({
    nodeId: 'node-1',
    // transport: TransportAdapters.Redis(),
    logger: console,
    logLevel: 'info',
    preferLocal: false
})

const logger = broker1.getLogger('NewLogger')

broker1.createService({
    name: 'test1',
    actions: {
        hello (context) {
            this.log.info(context.level)
            context.emit('testes')
            return context.call('$node.actions')
        }
    },
    events: {
        testes () {
            console.log('Sdasdasda')
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
