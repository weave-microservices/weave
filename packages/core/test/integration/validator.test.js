const { Weave } = require('../../lib/index')

describe('Test param validator', () => {
  it('should fail with error and validation data.', (done) => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    })

    node1.createService({
      name: 'testService',
      actions: {
        sayHello: {
          params: {
            name: { type: 'string', minLength: 10 }
          },
          handler (context) {
            return `Hello ${context.params.name}!`
          }
        }
      }
    })

    node1.start().then(() => {
      node1.call('testService.sayHello', { name: 'Hans' })
        .catch(error => {
          expect(error.name).toBe('WeaveParameterValidationError')
          expect(error.message).toBe('Parameter validation error')
          done()
        })
    })
  })

  it('should fail with error and validation data.', (done) => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    })

    node1.createService({
      name: 'testService',
      actions: {
        sayHello: {
          params: {
            name: 'string'
          },
          handler (context) {
            return `Hello ${context.params.name}!`
          }
        }
      }
    })

    node1.start().then(() => {
      node1.call('testService.sayHello', { name: 1 })
        .catch(error => {
          expect(error.name).toBe('WeaveParameterValidationError')
          expect(error.message).toBe('Parameter validation error')
          done()
        })
    })
  })
})

