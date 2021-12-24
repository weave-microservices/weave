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
        },
        act1 (context) {
          return context.call('test-service.act2')
        },
        act2 (context) {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(context.call('test-service.act3'))
            }, 500)
          })
        },
        act3 () {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve('hello')
            }, 400)
          })
        }
      }
    })

    return broker.start()
  })

  afterEach(() => broker.stop())

  it('should throw an timeout after for distributed action calls', (done) => {
    broker.call('test-service.act1')
      .then(result => {
        done()
      })
      .catch(error => {
        expect(error.message).toBe('Action test-service.testAction timed out node node1.')
        done()
      })
  })
})
