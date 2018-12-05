const { Weave } = require('../lib/index.js')
const fs = require('fs')
const path = require('path')

const broker1 = Weave({
    nodeId: 'node-1',
    transport: 'redis',
    logger: console,
    // logLevel: 'debug',
    middlewares: [{
        localAction: function (handler, action) {
            if (action.name === 'file.get') {
                return (context) => {
                    return handler(context)
                }
            }
            return handler
        }
    }],
    cache: true,
    preferLocal: false
})

broker1.createService({
    name: 'file',
    actions: {
        get (context) {
            return fs.createReadStream('/Users/kevinries/Downloads/StarCraft-Setup.zip')
        },
        save (context) {
            const stream = context.params
            const { fileName } = context.meta
            const newStream = fs.createWriteStream(path.join(__dirname, 'test', Date.now() + fileName))

            const startTime = Date.now()
            stream.pipe(newStream)
            stream.on('data', chunk => {
                this.uploadedSize += chunk.length
                this.broker.log.info('RECV: ', this.uploadedSize)
            })

            stream.on('end', () => {
                const endTime = Date.now()

                this.broker.log.info(`Transfered ${this.uploadedSize} bytes in ${endTime - startTime} ms`)
            })
        }
    },
    created () {
        this.uploadedSize = 0
    }
})

// Create broker #2
const broker2 = Weave({
    nodeId: 'node-2',
    transport: 'redis'
    // logLevel: 'debug'

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
            broker2.call('file.get').then(function (stream) {
                broker2.call('file.save', stream, { meta: {
                    fileName: 'new.zip'
                }})
            })
        })
})
