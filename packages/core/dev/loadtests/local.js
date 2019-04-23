/* eslint-disable no-console */
const random = require('lodash/random')
const os = require('os')
const hostname = os.hostname()
const { Weave } = require('../../lib/index.js')

// Create broker
const broker = Weave({
    nodeId: hostname + '-server',
    cache: false,
    logger: {
        enabled: false
    }
})

broker.createService({
    name: 'math',
    actions: {
        add: {
            handler (context) {
                return Number(context.params.a) + Number(context.params.b)
            }
        }
    }
})

const payload = { a: random(0, 100), b: random(0, 100) }
let count = 0

function work () {
    broker.call('math.add', payload).then(res => {
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

broker.start().then(() => {
    count = 0

    setTimeout(() => {
        let startTime = Date.now()
        work()

        setInterval(() => {
            if (count > 0) {
                const requestsPerSecond = count / ((Date.now() - startTime) / 1000)
                console.log(Number(requestsPerSecond.toFixed(0)), 'requests/s')
                count = 0
                startTime = Date.now()
            }
        }, 1000)
    }, 1000)
})
