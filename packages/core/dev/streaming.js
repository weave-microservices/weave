const { Weave } = require('../lib/index.js')
const fs = require('fs')
const path = require('path')

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
    name: 'file',
    actions: {
        get (context) {
            const p = '/Users/kevinries/Downloads/StarCraft-Setup.zip'
            const stats = fs.statSync(p)
            console.log(context)
            context.meta.fileSize = stats.size
            return fs.createReadStream(p)
        },
        save (context) {
            return new Promise((resolve, reject) => {
                const stream = context.params
                const { fileName } = context.meta
                const newFilePath = path.join(__dirname, 'test', Date.now() + fileName)
                const newStream = fs.createWriteStream(newFilePath)

                const startTime = Date.now()
                stream.pipe(newStream)
                stream.on('data', chunk => {
                    this.uploadedSize += chunk.length
                    this.broker.log.info('RECV: ', this.uploadedSize, 'of ', context.meta.fileSize)
                })

                stream.on('end', () => {
                    const endTime = Date.now()
                    this.broker.log.info(`Transfered ${this.uploadedSize} bytes in ${endTime - startTime} ms`)
                    resolve(newFilePath)
                })
            })
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
    broker2.waitForServices(['file'])
        .then(() => {
            const p = broker2.call('file.get')
            p.then(function (stream) {
                broker2.call('file.save', stream, { meta: {
                    fileName: 'new.zip'
                }})
                    .then((path) => {
                        fs.unlinkSync(path)
                        return Promise.resolve()
                    })
                    .then(() => Promise.all([
                        broker1.stop(),
                        broker2.stop()
                    ]))
            })
        })
})
