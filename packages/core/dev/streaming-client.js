const { Weave } = require('../lib/index.js')
const fs = require('fs')
const path = require('path')
const { Transform } = require('stream')

const broker1 = Weave({
    namespace: 'stream-client-server',
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
        },
        reverse (context) {
            const stream = context.params
            return stream.pipe(new Transform({
                transform: function (chunk, encoding, done) {
                    const textArray = chunk.toString().split('')
                    this.push(textArray.reverse().join(''))
                    return done()
                }
            }))
        }
    },
    created () {
        this.uploadedSize = 0
    }
})

Promise.all([
    broker1.start()
])
