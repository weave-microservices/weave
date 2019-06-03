const { Weave } = require('../lib/index.js')
const { Transform } = require('stream')

const broker1 = Weave({
    namespace: 'stream',
    nodeId: 'node-1' + process.pid,
    transport: 'redis',
    logLevel: 'info',
    middlewares: [{
        localAction: function (handler, action) {
            if (action.name === 'file.get') {
                return (context) => {
                    return handler(context)
                }
            }
            return handler
        }
    }]
})

broker1.createService({
    name: 'transform',
    actions: {
        reverse (context) {
            return context.params.pipe(new Transform({
                transform (chunk, encoding, done) {
                    this.push(chunk.reverse())
                    done()
                }
            }))
        }
    },
    created () {
        this.uploadedSize = 0
    }
})

// Create broker #2
const broker2 = Weave({
    namespace: 'stream',
    nodeId: 'node-2' + process.pid,
    transport: 'redis',
    logLevel: 'info'

})

broker2.createService({
    name: 'test2',
    actions: {
        hello (context) {
            this.log.info(context.level)
            return context.call('test3.hello')
        }
    }
})

Promise.all([
    broker1.start(),
    broker2.start()
]).then(() => {
    broker2.waitForServices(['transform'])
        .then(() => {
            broker2.call('transform.reverse', process.stdin)
                .then(stream => {
                    stream.pipe(process.stdout)
                    stream.on('end', () => {
                        broker1.stop()
                        broker2.stop()
                    })
                })
        })
})
