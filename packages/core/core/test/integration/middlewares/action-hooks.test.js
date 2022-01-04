const { Weave } = require('../../../lib/index')

// describe('Action hooks', () => {
//   const fetchName = jest.fn()
//   const method1 = jest.fn()
//   const method2 = jest.fn()
//   const arrayMethod = jest.fn()
//   const log = jest.fn()
//   const afterGreet = jest.fn()
//   const errorHook = jest.fn((_, error) => {
//     Promise.reject(error)
//   })
//   const wildcardErrorHook = jest.fn((_, error) => Promise.reject(error))

//   const broker = Weave({
//     nodeId: 'test-node',
//     logger: {
//       enabled: false,
//       level: 'fatal'
//     }
//   })

//   broker.createService({
//     name: 'greeter',
//     hooks: {
//       before: {
//         '*': log,
//         sayHello: fetchName
//       },
//       after: {
//         '*': log,
//         sayHello: [
//           'method1',
//           'method2',
//           arrayMethod
//         ],
//         greet: 'afterGreet'
//       },
//       error: {
//         '*': 'wildcardErrorHook',
//         errorAction: 'errorHook'
//       }
//     },
//     actions: {
//       sayHello: {
//         params: {
//           id: 'number'
//         },
//         handler (context) {
//           return 'hello'
//         }
//       },
//       greet (context) {
//         return 'hello'
//       },
//       errorAction () {
//         return Promise.reject(new Error('Error'))
//       }
//     },
//     methods: {
//       fetchName,
//       method1,
//       method2,
//       afterGreet,
//       errorHook,
//       wildcardErrorHook
//     }
//   })

//   beforeAll(() => broker.start())
//   afterAll(() => broker.stop())

//   it('should call a before wildcard hock.', (done) => {
//     broker.call('greeter.sayHello', { id: 1 })
//       .then(res => {
//         expect(log).toBeCalledTimes(2)
//         done()
//       })
//   })

//   it('should call a before hock by action name.', (done) => {
//     broker.call('greeter.sayHello', { id: 1 })
//       .then(res => {
//         expect(fetchName).toBeCalledTimes(2)
//         done()
//       })
//   })

//   it('should call a  hock by action name.', (done) => {
//     broker.call('greeter.sayHello', { id: 1 })
//       .then(res => {
//         expect(method1).toBeCalledTimes(3)
//         expect(method2).toBeCalledTimes(3)
//         done()
//       })
//   })

//   it('should call a hook by string.', (done) => {
//     broker.call('greeter.greet', { id: 1 })
//       .then(res => {
//         expect(afterGreet).toBeCalledTimes(1)
//         done()
//       })
//   })

//   it('should call a hook error hook.', (done) => {
//     broker.call('greeter.errorAction', { id: 1 })
//       .catch(error => {
//         expect(error.message).toBe('Error')
//         expect(errorHook).toBeCalledTimes(1)
//         expect(wildcardErrorHook).toBeCalledTimes(1)
//         done()
//       })
//   })
// })

describe('Action hooks in action definition', () => {
  const fetchName = jest.fn()
  const method1 = jest.fn()
  const method2 = jest.fn()
  const arrayMethod = jest.fn()
  const afterGreet = jest.fn()
  const errorHook = jest.fn((_, error) => {
    return Promise.reject(error)
  })

  const broker = Weave({
    nodeId: 'action-hook-node',
    logger: {
      enabled: false,
      level: 'fatal'
    }
  })

  broker.createService({
    name: 'greeter',
    actions: {
      sayHello: {
        params: {
          id: 'number'
        },
        hooks: {
          before: [
            fetchName
          ],
          after: [
            'method1',
            'method2',
            arrayMethod,
            'afterGreet'
          ],
          error: [
            (context) => {
              console.log(context)
            }
          ]
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
      errorHook
    }
  })

  beforeAll(() => broker.start())
  afterAll(() => broker.stop())

  it('should call a before hock in action definition.', (done) => {
    broker.call('greeter.sayHello', { id: 1 })
      .then(res => {
        expect(fetchName).toBeCalledTimes(1)
        done()
      })
  })

  it('should call a before hock by action name in action definition.', (done) => {
    broker.call('greeter.sayHello', { id: 1 })
      .then(res => {
        expect(fetchName).toBeCalledTimes(2)
        done()
      })
  })

  it('should call a hock by action name in action definition.', (done) => {
    broker.call('greeter.sayHello', { id: 1 })
      .then(res => {
        expect(method1).toBeCalledTimes(3)
        expect(method2).toBeCalledTimes(3)
        done()
      })
  })

  it('should call a after-hook by string in action definition.', (done) => {
    broker.call('greeter.greet', { id: 1 })
      .then(res => {
        expect(afterGreet).toBeCalledTimes(3)
        done()
      })
  })

  it('should call a hook error hook in action definition.', (done) => {
    broker.call('greeter.errorAction', { id: 1 })
      .catch(error => {
        expect(error.message).toBe('Error')
        expect(errorHook).toBeCalledTimes(1)
        done()
      })
  })
})
