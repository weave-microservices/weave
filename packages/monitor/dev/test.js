const path = require('path')
const { Weave } = require('@weave-js/core')

const broker = Weave({
    nodeId: 'monitor-test',
    logLevel: 'info',
    transport: {
        adapter: 'redis'
        // offlineNodeCheckInterval: 10000,
        // maxOfflineTime: 5000
    },
    watchServices: true,
    metrics: {
        enabled: true,
        metricRate: 1
    }
})

broker.createService({
    name: 'hihi',
    actions: {
        trim: {
            params: {
                text: 'string'
            },
            handler (context) {

            }
        }
    },
    events: {
        '$node.connected' () {

        }
    }
})

broker.createService({
    mixins: require(path.join(__dirname, '..', 'lib', 'index.js'))()
})

broker.start()
