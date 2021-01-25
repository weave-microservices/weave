const { createBroker } = require('../../lib/index')

describe('Action hooks', () => {
  const fetchName = jest.fn()
  const method1 = jest.fn()
  const method2 = jest.fn()
  const arrayMethod = jest.fn()
  const log = jest.fn()
  const afterGreet = jest.fn()
  const errorHook = jest.fn((_, error) => Promise.reject(error))
  const wildcardErrorHook = jest.fn((_, error) => Promise.reject(error))

  const broker = createBroker({
    nodeId: 'test-node',
    logger: {
      enableD: false,
      logLevel: 'fatal'
    }
  })

  broker.createService({
    name: 'greeter',
    hooks: {
      before: {
        '*': log,
        sayHello: fetchName
      },
      after: {
        '*': log,
        sayHello: [
          'method1',
          'method2',
          arrayMethod
        ],
        greet: 'afterGreet'
      },
      error: {
        '*': 'wildcardErrorHook',
        errorAction: 'errorHook'
      }
    },
    actions: {
      sayHello: {
        params: {
          id: 'number'
        },
        handler (context) {
          return 'hello'
        }
      },
      greet (context) {
        return 'hello'
      },
      errorAction () {
        return Promise.reject(new Error('Error'))
      }
    },
    methods: {
      fetchName,
      method1,
      method2,
      afterGreet,
      errorHook,
      wildcardErrorHook
    }
  })

  beforeAll(() => broker.start())
  afterAll(() => broker.stop())

  it('should call a before wildcard hock.', (done) => {
    return broker.call('greeter.sayHello', { id: 1 })
      .then(res => {
        expect(log).toBeCalledTimes(2)
        done()
      })
  })

  it('should call a before hock by action name.', (done) => {
    return broker.call('greeter.sayHello', { id: 1 })
      .then(res => {
        expect(fetchName).toBeCalledTimes(2)
        done()
      })
  })

  it('should call a  hock by action name.', (done) => {
    return broker.call('greeter.sayHello', { id: 1 })
      .then(res => {
        expect(method1).toBeCalledTimes(3)
        expect(method2).toBeCalledTimes(3)
        done()
      })
  })

  it('should call a hook by string.', (done) => {
    return broker.call('greeter.greet', { id: 1 })
      .then(res => {
        expect(afterGreet).toBeCalledTimes(1)
        done()
      })
  })

  it('should call a hook error hook.', (done) => {
    return broker.call('greeter.errorAction', { id: 1 })
      .catch(error => {
        expect(error.message).toBe('Error')
        expect(errorHook).toBeCalledTimes(1)
        expect(wildcardErrorHook).toBeCalledTimes(1)
        done()
      })
  })
})
