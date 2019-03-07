const path = require('path')
const { Weave } = require('@weave-js/core')

const broker = Weave({
    nodeId: 'monitor-test',
    logLevel: 'info',
    transport: 'redis',
    watchServices: true,
    metrics: {
        enabled: true,
        metricRate: 1
    }
})

broker.createService({
    mixins: require(path.join(__dirname, '..', 'lib', 'index.js'))()
})

broker.start()
