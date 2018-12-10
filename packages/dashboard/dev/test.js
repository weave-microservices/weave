const path = require('path')
const { Weave } = require('@weave-js/core')

const broker = Weave({
    namespace: 'ciris',
    nodeId: 'dashboard-test',
    logLevel: 'info',
    transport: 'redis',
    watchServices: true
})

broker.createService({
    mixins: require(path.join(__dirname,'..', 'lib', 'index.js'))()
})

broker.start()
