const Weave = require('../../lib/index')
const adapters = require('../../adapters.js')

const app1 = Weave({
    nodeId: 'app1',
    internalActionsAccessable: true,
    transport: adapters.Fake()
})

app1.createService({
    name: 'math'
})

app1.start()

const app2 = Weave({
    nodeId: 'app2',
    transport: adapters.Fake()
})

app2.start()
    .then(app2.waitForServices('math'))
    .then(() => {
        setInterval(() => {
            app2.call('$node.health', null, { nodeId: 'app1' })
                .then(result => console.log(result))
        }, 2000)
    })
