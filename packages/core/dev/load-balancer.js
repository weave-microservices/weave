const { Weave, TransportAdapters } = require('../lib/index.js')

const brokerStore = []
for (let i = 0; i < 11; i++) {
    const broker = createBroker(i)
    brokerStore.push(broker)
}

Promise.all(brokerStore.map(broker => broker.start())).then(() => {
    // const callBroker = createBroker(100)
    // callBroker.start()
    setTimeout(() => {
        setInterval(() => {
            brokerStore[0].ping('node-2')
                .then(res => {
                    console.table(res)
                    // brokerStore[0].log.info(res)
                    // callBroker.log.info(res)
                    // console.log(res)
                })
            // brokerStore[0].call('test.hello')
            //     .then(res => {
            //         brokerStore[0].log.info(res)
            //         // callBroker.log.info(res)
            //         // console.log(res)
            //     })
        }, 1000)
    }, 4000)
})

function createBroker (index) {
    const broker = Weave({
        namespace: 'lb',
        nodeId: 'node-' + index,
        transport: {
            adapter: 'redis'
        },
        logger: {
            logLevel: 'info'
        },
        registry: {
            preferLocalActions: false
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
