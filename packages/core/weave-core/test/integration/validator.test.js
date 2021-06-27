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
            return `Hello ${context.data.name}!`
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
            return `Hello ${context.data.name}!`
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

describe('Validator strict mode', () => {
  it('should remove invalid params on strict mode "remove" (global)', (done) => {
    const node1 = Weave({
      nodeId: 'node_strict',
      logger: {
        enabled: false
      },
      validatorOptions: {
        strict: true,
        strictMode: 'remove'
      }
    })

    node1.createService({
      name: 'testService',
      actions: {
        sayHello: {
          params: {
            name: { type: 'string' }
          },
          handler (context) {
            expect(context.data.name).toBe('Hans')
            expect(context.data.lastname).toBeUndefined()
            done()
          }
        }
      }
    })

    node1.start().then(() => {
      node1.call('testService.sayHello', { name: 'Hans', lastname: 'hans' })
    })
  })

  it('should throw an error if ther are invalid params on strict mode "error" (global)', (done) => {
    const node1 = Weave({
      nodeId: 'node_strict',
      logger: {
        enabled: false
      },
      validatorOptions: {
        strict: true,
        strictMode: 'error'
      }
    })

    node1.createService({
      name: 'testService',
      actions: {
        sayHello: {
          params: {
            name: { type: 'string' }
          },
          handler (context) {
            // nothing to do
          }
        }
      }
    })

    node1.start().then(() => {
      node1.call('testService.sayHello', { name: 'Hans', lastname: 'hans' })
        .catch((error) => {
          expect(error.data.length).toBe(1)
          const [validationError] = error.data

          expect(validationError.action).toBe('testService.sayHello')
          expect(validationError.expected).toBe('name')
          expect(validationError.field).toBe('$root')
          expect(validationError.message).toBe('The object "$root" contains forbidden keys: "lastname".')
          expect(validationError.nodeId).toBe('node_strict')
          expect(validationError.passed).toBe('lastname')
          expect(validationError.type).toBe('objectStrict')
          done()
        })
    })
  })
})
