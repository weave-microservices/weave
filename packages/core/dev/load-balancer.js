const Weave = require('../lib/index.js')
const adapters = require('../adapters')

const brokerStore = []
for (let i = 0; i <= 5; i++) {
    brokerStore.push(createBroker(i).start())
}

Promise.all(brokerStore).then(() => {
    const callBroker = createBroker(100)
    callBroker.start()
    setTimeout(() => {
        setInterval(() => {
            callBroker.call('test.hello')
                .then(res => callBroker.log.info(res))
        }, 200)
    }, 4000)
})

function createBroker (index) {
    const broker = Weave({
        nodeId: 'node-' + index,
        transport: adapters.Redis(),
        logger: console,
        preferLocal: false
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
