const path = require('path')
const { Weave } = require('@weave-js/core')

const broker = Weave({
    nodeId: 'monitor-test',
    logger: {
        logLevel: 'info'
    },
    transport: {
        adapter: 'redis'
        // offlineNodeCheckInterval: 10000,
        // maxOfflineTime: 5000
    },
    watchServices: true,
    tracing: {
        enabled: true
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
                return context.call('hihi.trim2', context.params)
            }
        },
        trim2: {
            params: {
                text: 'string'
            },
            handler (context) {
                return 'dadasd'
            }
        }
    },
    started () {
        setInterval(() => this.broker.call('hihi.trim', { text: 'adsasd' }), 4000)
    }
})

broker.createService({
    mixins: require(path.join(__dirname, '..', 'lib', 'index.js'))()
})

broker.start()
