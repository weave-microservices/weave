const { Weave, Errors } = require('../../../lib/index')
const LocalService = require('../../services/local.service')

describe('Connected services', () => {
  it('should return results of all connected nodes.', done => {
    const broker1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false,
        logLevel: 'fatal'
      },
      transport: 'dummy'
    })

    const broker2 = Weave({
      nodeId: 'node2',
      logger: {
        enabled: false,
        logLevel: 'fatal'
      },
      transport: 'dummy'
    })

    broker1.createService(LocalService)

    return Promise.all([
      broker1.start(),
      broker2.start()
    ])
      .then(() => broker1.waitForServices(['local']))
      .then(() => broker2.call('local.hidden', { text: 'test' }))
      .catch(error => {
        const expectedError = new Errors.WeaveServiceNotFoundError({ actionName: 'local.hidden' })
        expect(error).toEqual(expectedError)
        done()
        return Promise.all([
          broker1.stop(),
          broker2.stop()
        ])
      })
  })
})
