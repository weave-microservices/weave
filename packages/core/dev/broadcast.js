const { Weave, TransportAdapters } = require('../lib/index.js')

const app1 = Weave({
    nodeId: '1',
    logLevel: 'debug',
    transport: 'nats'
})

app1.createService({
    name: 'testService2',
    events: {
        'app.run' () {
            console.log('jooooo1')
        }
    }
})

const app2 = Weave({
    nodeId: '2',
    logLevel: 'debug',
    transport: 'nats'
})

app2.createService({
    name: 'testService',
    events: {
        'app.run' () {
            console.log('jooooo2')
        }
    }
})
app2.br

Promise.all([
    app1.start(),
    app2.start()
]).then(() => app1.waitForServices(['testService']))
    .then(() => {
        app1.broadcast('app.run')
    })
