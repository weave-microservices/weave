const { Weave, TransportAdapters } = require('../lib/index.js')

const brokerStore = []
for (let i = 0; i < 200; i++) {
    const broker = createBroker(i)
    brokerStore.push(broker)
}

Promise.all(brokerStore.map(broker => broker.start())).then(() => {
    // const callBroker = createBroker(100)
    // callBroker.start()
    setTimeout(() => {
        setInterval(() => {
            brokerStore[0].call('test.hello')
                .then(res => {
                    // callBroker.log.info(res)
                    console.log(res)
                })
        }, 100)
    }, 4000)
})

function createBroker (index) {
    const broker = Weave({
        namespace: 'ciris',
        nodeId: 'node-' + index,
        transport: TransportAdapters.NATS(),
        logLevel: 'info',
        preferLocal: false,
        metrics: {
            enabled: true
        }
    })

    broker.createService({
        name: 'test',
        actions: {
            hello (context) {
                return Promise.resolve('Hello from ' + this.broker.nodeId)
            }
        }
    })
    return broker
}
