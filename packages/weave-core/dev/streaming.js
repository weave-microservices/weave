const Weave = require('../lib/index.js')
const adapters = require('../adapters')
const fs = require('fs')
const path = require('path')

const broker1 = Weave({
    nodeId: 'node-1',
    transport: adapters.Redis(),
    logger: console,
    logLevel: 'debug',
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
    cacher: true,
    preferLocal: false
})

broker1.createService({
    name: 'file',
    actions: {
        get (context) {
            return fs.createReadStream('/Users/kevinries/Desktop/moco-project-0.1.3.dmg')
        },
        save (context) {
            const stream = context.params
            const { fileName } = context.meta
            const newStream = fs.createWriteStream(path.join(__dirname, 'test', Date.now() + fileName))
            stream.pipe(newStream)
        }
    }
})

// Create broker #2
const broker2 = Weave({
    nodeId: 'node-2',
    transport: adapters.Redis(),
    logger: console
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
                    fileName: 'moco-project-0.1.3.dmg'
                }})
            })
        })
        //     broker2.call('file.get').then(function (stream) {
        //         const newFile = fs.createWriteStream(path.join(__dirname, 'test', 'moco-project-0.1.3.dmg'))
        //         stream.pipe(newFile)
        //         let uploadedSize = 0
        //         stream.on('data', chunk => {
        //             uploadedSize += chunk.length
        //         })

        //         newFile.on('close', () => {
        //             broker2.log.info('RECV: ' + uploadedSize)
        //         })

        //         newFile.on('error', () => {
        //             broker2.log.info('RECV: ' + uploadedSize)
        //         })
        //         broker1.log.info('ok')
        //     })
        // })
})
