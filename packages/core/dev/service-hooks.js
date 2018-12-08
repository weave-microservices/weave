const { Weave } = require('../lib/index.js')
const path = require('path')

// Create broker #1
const broker1 = Weave({
    nodeId: 'node-1',
    logger: console,
    logLevel: 'debug',
    preferLocal: false,
    requestTimeout: 2000,
    // watchServices: true,
    registry: {
        // preferLocal: false
    }
})

broker1.loadService(path.join(__dirname, 'services', 'slow.service.js'))

broker1.start()
    .then(() => {
        // setTimeout(() => {
        //     broker1.stop()
        // }, 1000)
    })
