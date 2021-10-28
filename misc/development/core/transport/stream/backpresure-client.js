const { createBroker, TransportAdapters } = require('../../../../../packages/core/core/lib')
const repl = require('../../../../../packages/core/repl/lib/index')
const fs = require('fs')

const broker = createBroker({
    nodeId: 'client',
    transport: {
        adapter: TransportAdapters.TCP()
    }
})

broker.createService({
    name: 'client',
    actions: {
        async receive (context) {
            const stream = await context.call('server.send')
            const file = fs.createWriteStream('target.txt')
            stream.pipe(file)
            // stream.on('data', (chunk) => {
            //     this.log.info(chunk.length)
            // })
        }
    }
})

broker.start()
    .then(() => repl(broker))

