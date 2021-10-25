const { createBroker } = require('../../../packages/core/core')
const repl = require('../../../packages/core/repl')

const { createLockService } = require('../../../packages/services/lock/lib/lock-service')

const broker = createBroker({
  nodeId: 'lock'
})

broker.createService(createLockService())

broker.createService({
  name: 'user',
  actions: {
    edit: {
      params: {
        id: 'string'
      },
      async handler (context) {
        const { id } = context.data
        return new Promise(async (resolve, reject) => {
          if (!await context.call('$lock.isLocked', { value: id })) {
            await context.call('$lock.acquireLock', { value: id })
            setTimeout(async () => {
              await context.call('$lock.releaseLock', { value: id })
              resolve(true)
            }, 4000)
          } else {
            reject('locked')
          }
        })
      }
    }
  }
})

broker.start().then(() => {
  setInterval(() => {
    broker.call('user.edit', { id: 'kevinries' })
  }, 5000)
  repl(broker)
})
