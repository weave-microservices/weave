const { Weave } = require('../../lib/index')

describe('Test broker lifecycle', () => {
  it('should verify that started hook is a fuction.', () => {
    expect(() => {
      Weave({
        nodeId: 'node1',
        logger: {
          enabled: false,
          logLevel: 'fatal'
        },
        started: {}
      })
    }).toThrow('Started hook have to be a function.')
  })

  it('should verify that stopped hook is a fuction.', () => {
    expect(() => {
      Weave({
        nodeId: 'node1',
        logger: {
          enabled: false,
          logLevel: 'fatal'
        },
        stopped: {}
      })
    }).toThrow('Stopped hook have to be a function.')
  })

  it('should create a broker and call the started/stopped hook.', (done) => {
    const startedHook = jest.fn()
    const stoppedHook = jest.fn()

    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false,
        logLevel: 'fatal'
      },
      started: startedHook,
      stopped: stoppedHook
    })

    node1.start().then(() => {
      expect(startedHook).toBeCalled()

      node1.stop().then(() => {
        expect(stoppedHook).toBeCalled()
        done()
      })
    })
  })
})

describe('Test broker call service', () => {
  it('should call a service.', (done) => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false,
        logLevel: 'fatal'
      }
    })

    const service = node1.createService({
      name: 'testService',
      actions: {
        test: jest.fn(),
        test2: jest.fn()
      }
    })

    node1.start().then(() => {
      node1.call('testService.test')
        .then(() => {
          expect(service.schema.actions.test).toBeCalled()
          done()
        })
    })
  })

  it('should call a service action and return a value.', (done) => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false,
        logLevel: 'fatal'
      }
    })

    node1.createService({
      name: 'testService',
      actions: {
        sayHello (context) {
          return `Hello ${context.params.name}!`
        }
      }
    })

    node1.start().then(() => {
      node1.call('testService.sayHello', { name: 'Hans' })
        .then(result => {
          expect(result).toBe('Hello Hans!')
          done()
        })
    })
  })
})

describe('Test broker call error handling', () => {
  it('should call a service action and be rejected with an error.', (done) => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false,
        logLevel: 'fatal'
      }
    })

    node1.createService({
      name: 'testService',
      actions: {
        sayHello (context) {
          return Promise.reject(new Error('Error from action'))
        }
      }
    })

    node1.start().then(() => {
      node1.call('testService.sayHello', { name: 'Hans' })
        .catch(error => {
          expect(error.message).toBe('Error from action')
          done()
        })
    })
  })

  it('should call a service action and be rejected with an error from a sub action.', (done) => {
    const node1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false,
        logLevel: 'fatal'
      }
    })

    node1.createService({
      name: 'testService',
      actions: {
        sayHello (context) {
          return context.call('testService.greetings', context.params)
        },
        greetings (context) {
          return Promise.reject(new Error('Error from action level ' + context.level))
        }
      }
    })

    node1.start().then(() => {
      node1.call('testService.sayHello', { name: 'Hans' })
        .catch(error => {
          expect(error.message).toBe('Error from action level 2')
          done()
          return node1.stop()
        })
    })
  })
})

describe('Test broker trasnport resolver', () => {
  it('should resolve the transport adapter by name (string).', () => {
    const broker = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false,
        logLevel: 'fatal'
      },
      transport: 'dummy'
    })

    expect(broker.transport.adapterName).toBe('Dummy')
    broker.stop()
  })
})

describe('Ping', () => {
  it('should result an empty array if the transporter is not connected.', done => {
    const broker = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false,
        logLevel: 'fatal'
      }
    })
    return broker.start()
      .then(() => broker.ping())
      .then(res => {
        expect(res).toEqual([])
        done()
        return broker.stop()
      })
  })
  it('should return an empty object if no nodes are connected.', done => {
    const broker = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false,
        logLevel: 'fatal'
      },
      transport: 'dummy'
    })

    return broker.start()
      .then(() => broker.ping())
      .then(res => {
        expect(res).toEqual({})
        done()
        return broker.stop()
      })
  })

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

    return Promise.all([
      broker1.start(),
      broker2.start()
    ])
      .then(() => broker1.ping())
      .then(res => {
        expect(res.node2).toBeDefined()
        expect(res.node2.timeDiff).toBeDefined()
        expect(res.node2.elapsedTime).toBeLessThan(5)
        expect(res.node2.nodeId).toBe('node2')
        done()
        return Promise.all([
          broker1.stop(),
          broker2.stop()
        ])
      })
  })

  it('should throw a timeout error if a node not responding.', done => {
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

    return Promise.all([
      broker1.start(),
      broker2.start()
    ])
      .then(() => broker1.ping('node3')) // node with this name is not existing
      .then(res => {
        expect(res).toBeNull()
        done()
        return Promise.all([
          broker1.stop(),
          broker2.stop()
        ])
      })
  })

  it('should return result of a given nodeId.', done => {
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

    return Promise.all([
      broker1.start(),
      broker2.start()
    ])
      .then(() => broker1.ping('node2'))
      .then(res => {
        expect(res.elapsedTime).toBeLessThan(5)
        expect(res.timeDiff).toBeDefined()
        expect(res.nodeId).toBe('node2')
        done()
        return Promise.all([
          broker1.stop(),
          broker2.stop()
        ])
      })
  })
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

    return Promise.all([
      broker1.start(),
      broker2.start()
    ])
      .then(() => broker1.ping('node2'))
      .then(res => {
        expect(res.elapsedTime).toBeLessThan(5)
        expect(res.timeDiff).toBeDefined()
        expect(res.nodeId).toBe('node2')
        done()
        return Promise.all([
          broker1.stop(),
          broker2.stop()
        ])
      })
  })
})

describe('Test broker error handling', () => {
  const ERROR_CODE = 1
  let broker

  beforeEach(d => {
    broker = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false,
        logLevel: 'fatal'
      }
    })

    broker.start()
      .then(() => d())
  })

  afterEach(() => {
    broker.stop()
      .catch(_ => {})
  })

  it('"fatalError" should kill the node process', () => {
    const realProcess = process
    const exitMock = jest.fn()

    global.process = { ...realProcess, exit: exitMock }
    broker.fatalError('Throw some fatal error')
    expect(exitMock).toHaveBeenCalledWith(ERROR_CODE)
  })
})

// describe('Test repl', () => {
//     jest.mock('@weave-js/repl')
//     const repl = require('@weave-js/repl')
//     repl.mockImplementation(() => jest.fn())

//     it('should switch to repl mode', () => {
//         const broker = Weave({
//             logger: {
//                 logLevel: 'fatal'
//             }
//         })
//         broker.repl()

//         expect(repl).toHaveBeenCalledTimes(1)
//         expect(repl).toHaveBeenCalledWith(broker, null)
//     })
// })

// describe('Signal handling', () => {
//     it(`should handle SIGTERM`, (done) => {
//         const broker = Weave({
//             nodeId: 'node1',
//             logger: {
//                 logLevel: 'fatal'
//             }
//         })
//         broker.stop = jest.fn()
//         return broker.start()
//             .then(() => {
//                 process.once('SIGTERM', () => {
//                     expect(broker.stop).toHaveBeenCalledTimes(1)
//                     done()
//                 })
//                 process.kill(process.pid, 'SIGTERM')
//             })
//     })

//     it(`should handle SIGINT`, (done) => {
//         const broker = Weave({
//             nodeId: 'node1',
//             logger: {
//                 logLevel: 'fatal'
//             }
//         })
//         broker.stop = jest.fn()
//         return broker.start()
//             .then(() => {
//                 process.once('SIGINT', () => {
//                     expect(broker.stop).toHaveBeenCalledTimes(1)
//                     done()
//                 })
//                 process.kill(process.pid, 'SIGTERM')
//             })
//     })
// })
