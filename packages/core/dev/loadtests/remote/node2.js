const { Weave } = require('../../../lib/index.js')

// Create broker

const broker = Weave({
    namespace: 'loadtest',
    nodeId: 'node2',
    logLevel: 'info',
    transport: 'tcp'
})

broker.createService({
    name: 'math',
    actions: {
        add: {
            handler (context) {
                return Number(context.params.a) + Number(context.params.b)
            }
        }
    }
})

Promise.all([
    broker.start()
])
