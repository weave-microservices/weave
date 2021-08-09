// @ts-nocheck
const { Weave } = require('../../../lib/index')

describe('Timeout middleware', () => {
  let broker

  beforeEach(() => {
    broker = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      },
      registry: {
        requestTimeout: 1000
      }
    })

    broker.createService({
      name: 'test-service',
      actions: {
        testAction () {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve('hello')
            }, 2000)
          })
        }
      }
    })

    return broker.start()
  })

  afterEach(() => broker.stop())

  it('should throw an timeout after timeout', (done) => {
    broker.call('test-service.testAction')
      .catch(error => {
        expect(error.message).toBe('Action test-service.testAction timed out node node1.')
        done()
      })
  })

  // it('should throw an timeout after timeout', (done) => {
  //   return broker.call('test-service.testAction', null, { timeout: 3000 })
  //     .then(result => {
  //       expect(result).toBe('hello')
  //     })
  // })
})
