const { Weave } = require('../lib')

const b1 = Weave({
    nodeId: 'n1',
    
    logger: {
        logLevel: 'debug'
    },
    watchServices: true,
    metrics: {
        enabled: true
    },
    // cache: true,
    transport: 'redis'
})

const b2 = Weave({
    nodeId: 'n2',
    namespace: 'metrics',
    logger: {
        logLevel: 'debug'
    },
    watchServices: true,
    metrics: {
        enabled: false
    },
    // cache: true,
    transport: 'redis'
})

b1.createService({
    name: 'test'
})

b2.createService({
    name: 'test2',
    actions: {
        hello () {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(20)
                }, 100)
            })
        }
    },
    started () {
        setInterval(() => this.broker.call('test2.hello')
            .then(res => {
                console.log(this.broker.metrics.list())
            }), 2000)
    }
})

Promise.all([
    // b1.start(),
    b2.start()
])
