const { Weave } = require('../../../lib/index')

describe('Test context tracking', () => {
  it('should gracefully shutdown all services ()', async () => {
    const broker = Weave({
      contextTracking: {
        enabled: true
      },
      loadNodeService: false
    })

    const service = broker.createService({
      name: 'pusher',
      actions: {
        push () {
          return new Promise(resolve => {
            setTimeout(() => resolve(true), 2000)
          })
        }
      }
    })

    await broker.start()
    broker.call('pusher.push')
    await broker.stop()
    expect(service._trackedContexts.length).toBe(0)
  })

  it('should throw an error if one or more services can`t stopped gracefully.', async () => {
    const broker = Weave({
      contextTracking: {
        enabled: true,
        shutdownTimeout: 1000
      },
      loadNodeService: false
    })

    broker.createService({
      name: 'pusher',
      actions: {
        push () {
          return new Promise(resolve => {
            setTimeout(() => resolve(true), 2000)
          })
        }
      }
    })

    await broker.start()
    broker.call('pusher.push')
    await broker.stop()
    expect(broker.runtime.state.trackedContexts.length).toBe(0)
  })
})
