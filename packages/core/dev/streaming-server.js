const { Weave } = require('../lib/index.js')

const broker2 = Weave({
    namespace: 'stream-client-server',
    nodeId: 'node-2' + process.pid,
    transport: 'redis',
    logLevel: 'debug',
    maxQueueSize: 10
})
process.stdin.pipe(process.stdout)
Promise.all([
    broker2.start()
]).then(() => {
    broker2.waitForServices(['file'])
        .then(() => {
            // broker2.call('file.get').then(function (stream) {
            //     broker2.call('file.save', stream, { meta: {
            //         fileName: 'new.zip'
            //     }})
            // })
            broker2.call('file.reverse', process.stdin)
                .then(stream => {
                    stream.pipe(process.stdout)
                })
        })
})
