const { createBroker } = require('../../../lib/index')
const MathService = require('../../services/math.service')

describe('Transport', () => {
  it('should return results of all connected nodes.', done => {
    const broker1 = createBroker({
      nodeId: 'node1',
      logger: {
        enabled: false,
        logLevel: 'fatal'
      },
      transport: {
        adapter: 'Dummy'
      }
    })

    const broker2 = createBroker({
      nodeId: 'node2',
      logger: {
        enabled: false,
        logLevel: 'fatal'
      },
      transport: {
        adapter: 'Dummy'
      }
    })

    broker1.createService(MathService)

    return Promise.all([
      broker1.start(),
      broker2.start()
    ])
      .then(() => broker1.waitForServices(['math']))
      .then(() => broker2.call('math.add', { a: 1, b: 5 }))
      .then(res => {
        expect(res).toBe(6)
        done()
        return Promise.all([
          broker1.stop(),
          broker2.stop()
        ])
      })
  })
})
