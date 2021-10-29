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
      const file = fs.createWriteStream('target.dmg')
      stream.pipe(file)
      this.log.info('loading file...')
      let size = 0
      stream.on('data', (chunk) => {
        size += chunk.length
      })

      stream.on('end', (chunk) => {
        this.log.info(size)
      })
    }
  }
})

broker.start()
  .then(() => repl(broker))

