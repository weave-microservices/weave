const path = require('path')
const { Weave } = require('@weave-js/core')

const broker = Weave({
    nodeId: 'dashboard-test',
    logLevel: 'debug',
    transport: 'redis'
})

broker.createService({
    mixins: require(path.join(__dirname,'..', 'lib', 'index.js'))()
})

broker.start()
