const random = require('lodash/random')
const { Weave } = require('../../../lib/index.js')

function createBroker (opts, id) {
    const options = Object.assign({
        namespace: 'loadtest',
        transport: 'redis'
    }, opts)

    return Weave(options)
}

const broker1 = createBroker({
    nodeId: '1'
}, 1)

const payload = { a: random(0, 100), b: random(0, 100) }

let count = 0
let sumTime = 0

function work () {
    const startTime = process.hrtime()
    broker1.call('math.add', payload).then(res => {
        const diff = process.hrtime(startTime)
        const dur = (diff[0] + diff[1] / 1e9) * 1000
        sumTime += dur
        if (count++ % 10 * 1000) {
            // Fast cycle
            work()
        } else {
            // Slow cycle
            setImmediate(() => work())
        }
        return res
    }).catch(err => {
        throw err
    })
}
Promise.all([
    broker1.start()
]).then(() => broker1.waitForServices('math'))
    .then(() => {
        count = 0
        setTimeout(() => {
            let startTime = Date.now()
            work()

            setInterval(() => {
                if (count > 0) {
                    const requestsPerSecond = count / ((Date.now() - startTime) / 1000)
                    const latency = sumTime / count
                    broker1.log.info(Number(requestsPerSecond.toFixed(0)), 'requests/s', `Queue: ${broker1.transport.pendingRequests.size}`, `Latency: ${latency}`)
                    count = 0
                    sumTime = 0
                    startTime = Date.now()
                }
            }, 1000)
        }, 1000)
    })
