const { Weave } = require('../lib')
const path = require('path')

const app2 = Weave({
    nodeId: 'node2',
    logLevel: 'info',
    watchServices: true,
    metrics: {
        enabled: true
    },
    transport: 'redis'
})

app2.loadServices(path.join(__dirname, '/services'))

Promise.all([
    app2.start()
]).then(() => {
    const loop = () => {
        return app2.stop()
            .then(() => app2.start())
            .then(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve()
                    }, 5000)
                })
            })
            .then(() => loop())
    }
    loop()
})
