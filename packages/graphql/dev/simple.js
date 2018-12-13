const { Weave, TransportAdapters } = require('@weave-js/core')
const { createGraphQLGateway } = require('../lib/index')

const broker = Weave({
    nodeId: 'graphQl-Test-node',
    logLevel: 'info',
    transport: TransportAdapters.Fake(),
    preferLocal: false
})

const broker2 = Weave({
    nodeId: 'graphQl-Test-node 2  22222',
    logLevel: 'info',
    transport: TransportAdapters.Fake(),
    preferLocal: false
})

broker.loadService(__dirname + '/services/user.service.js')

broker2.loadService(__dirname + '/services/organization.service.js')

broker.createService({
    name: 'gateway',
    mixins: createGraphQLGateway()
})

Promise.all([
    broker2.start(),
    broker.start()
]).then(() => {
    return broker.call('$node.services')
        .then(res => console.log(res))
})
    .then(() => broker.repl())
    .then(() => {
        // setInterval(() => {
        //     broker.call('gateway.graphql', { query: '{ users { id, name, orgId, organization { name } } }' })
        //         .then(res => {
        //             console.log(JSON.stringify(res.data))
        //         })
        // }, 2000)
    })
