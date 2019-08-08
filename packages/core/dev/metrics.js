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

b1.createService({
    name: 'test',
    actions: {
        hello () {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(20)
                }, 100)
            })
        }
    }
})

b2.createService({
    name: 'test2',
    dependencies: ['test'],
    started () {
        setInterval(() => this.broker.call('test.hello')
            .then(res => {
                console.log(this.broker.metrics.list())
            }), 2000)
    }
})

Promise.all([
    b1.start(),
    b2.start()
])
