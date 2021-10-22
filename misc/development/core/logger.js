const { createBroker } = require('../../../packages/core/core/lib')

const broker = createBroker({
  logger: {
    level: 'debug'
  }
})

broker.createService({
  name: 'test',
  actions: {
    hello: {
      handler (context, { service }) {
        service
      }
    }
  }
})

broker.log.info({ name: 'Kevin' })
broker.log.error(new Error('asdassds'))
broker.log.debug('debug')
broker.log.fatal('fatal')
broker.log.verbose('verbose')
broker.log.warn('warn')
broker.log.info({ node: 123, name: 'sdasdas' }, 'test')
broker.log.info('test', { node: 123, name: 'sdasdas' })

broker.start()
