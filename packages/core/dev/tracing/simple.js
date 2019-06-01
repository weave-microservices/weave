const { Weave } = require('../../lib')

const app = Weave({
    nodeId: 'trace',
    watchServices: true,
    tracing: {
        enabled: true
    }
})

app.start()
