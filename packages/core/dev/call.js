const { Weave, TransportAdapters } = require('../lib/index.js')

const broker1 = Weave({
    nodeId: 'node-1',
    transport: TransportAdapters.Redis(),
    logger: console,
    logLevel: 'debug',
    preferLocal: false
})

broker1.createService({
    name: 'test1',
    actions: {
        hello (context) {
            this.log.info(context.level)
            return context.call('$node.actions')
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
