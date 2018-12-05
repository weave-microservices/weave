/* eslint-disable no-console */
const random = require('lodash/random')
// const os = require('os')
// const hostname = os.hostname()
const { Weave } = require('../../lib/index.js')

// Create broker

function createBroker (opts, id) {
    const options = Object.assign({
        transport: 'nats'
    }, opts)
    const broker = Weave(options)

    broker.createService({
        name: 'math' + id,
        actions: {
            add: {
                handler (context) {
                    return Number(context.params.a) + Number(context.params.b)
                }
            }
        }
    })

    return broker
}

const broker1 = createBroker({
    nodeId: '1'
}, 1)
const broker2 = createBroker({
    nodeId: '2'
}, 2)

const payload = { a: random(0, 100), b: random(0, 100) }

let count = 0

function work () {
    broker1.call('math2.add', payload).then(res => {
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
    broker1.start(),
    broker2.start()
]).then(() => {
    count = 0

    setTimeout(() => {
        let startTime = Date.now()
        work()

        setInterval(() => {
            if (count > 0) {
                const requestsPerSecond = count / ((Date.now() - startTime) / 1000)
                broker1.log.info(Number(requestsPerSecond.toFixed(0)), 'requests/s')
                count = 0
                startTime = Date.now()
            }
        }, 1000)
    }, 1000)
})
