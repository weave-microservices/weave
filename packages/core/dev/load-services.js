const { Weave, TransportAdapters } = require('../lib/index.js')

const broker = Weave({
    nodeId: 'load-Services-Node'
})

broker.loadServices()
    .then(() => broker.start())
