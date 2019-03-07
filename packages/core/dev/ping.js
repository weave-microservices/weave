const { Weave } = require('../lib')

const b1 = Weave({
    nodeId: 'n1',
    logLevel: 'debug',
    watchServices: true,
    metrics: {
        enabled: true
    },
    // cache: true,
    transport: 'redis'
})

const b2 = Weave({
    nodeId: 'n2',
    logLevel: 'debug',
    watchServices: true,
    metrics: {
        enabled: true
    },
    // cache: true,
    transport: 'redis'
})

b2.createService({
    name: 'test',
    started () {
        setInterval(() => this.broker.ping().then(res => console.table(res)), 2000)
    }
})

Promise.all([
    b1.start(),
    b2.start()
])
