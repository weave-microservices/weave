const { createNode } = require('../../helper')
const MathService = require('../../services/math.service')

describe('Transport', () => {
  it('should return results of all connected nodes.', done => {
    const broker1 = createNode({
      nodeId: 'node1',
      logger: {
        enabled: false,
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    })

    const broker2 = createNode({
      nodeId: 'node2',
      logger: {
        enabled: false,
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    })

    broker1.createService(MathService)

    Promise.all([
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
