const { Weave, TransportAdapters } = require('../lib/index.js')

const broker1 = Weave({
    nodeId: 'node-1',
    transport: TransportAdapters.Redis(),
    logger: console,
    logLevel: 'info',
    preferLocal: false,
    bulkhead: {
        enabled: true,
        concurrency: 1,
        maxQueueSize: 100
    }
})

broker1.createService({
    name: 'test1',
    actions: {
        hello: {
            params: {
                id: 'number'
            },
            handler (context) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        return resolve('result for ' + context.params.id)
                    }, 500)
                })
            }
        }
    }
})

Promise.all([
    broker1.start()
]).then(() => {
    const calls = []
    for (let i = 0; i < 20; i++) {
        calls.push(broker1.call('test1.hello', { id: i }))
    }
    Promise.all(calls)
        .then(res => console.log(res))
})
