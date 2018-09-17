const { Weave } = require('../lib/index.js')
const path = require('path')

// Create broker #1
const broker1 = Weave({
    nodeId: 'node-1',
    logger: console,
    logLevel: 'debug',
    preferLocal: false,
    requestTimeout: 2000,
    watchServices: true,
    middlewares: [
        {
            serviceCreated (service) {
                console.log(service.name)
            }
        }
    ],
    registry: {
        // preferLocal: false
    }
})

broker1.loadService(path.join(__dirname, 'services', 'math.service.js'))

broker1.start()
    .then(() => {
        broker1.call('math.add').then(res => console.log(res))
    })
