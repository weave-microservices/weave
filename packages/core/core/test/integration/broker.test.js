const { Weave } = require('../../lib/index')
const { Readable } = require('stream')

describe('Test broker lifecycle', () => {
  it('should create a broker and call the started/stopped hook.', (done) => {
    const startedHook = jest.fn()
    const stoppedHook = jest.fn()

    const node1 = Weave({
      nodeId: 'node-lifecycle1',
      logger: {
        enabled: false,
        level: 'fatal'
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
      nodeId: 'node-call1',
      logger: {
        enabled: false,
        level: 'fatal'
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
      nodeId: 'node-call21',
      logger: {
        enabled: false
      }
    })

    node1.createService({
      name: 'testService',
      actions: {
        sayHello (context) {
          return `Hello ${context.data.name}!`
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
      nodeId: 'node1-call',
      logger: {
        enabled: false
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
      nodeId: 'node-call3',
      logger: {
        enabled: false
      }
    })

    node1.createService({
      name: 'testService',
      actions: {
        sayHello (context) {
          return context.call('testService.greetings', context.data)
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

// describe('Test broker trasnport resolver', () => {
//   it('should resolve the transport adapter by name (string).', () => {
//     const broker = Weave({
//       nodeId: 'node1',
//       logger: {
//         enabled: false
//       },
//       transport: 'dummy'
//     })

//     expect(broker.runtime.transport.adapterName).toBe('Dummy')
//     broker.stop()
//   })
// })

describe('Ping', () => {
  it('should result an empty array if the transporter is not connected.', done => {
    const broker = Weave({
      nodeId: 'node-ping1',
      logger: {
        enabled: false
      }
    })
    broker.start()
      .then(() => broker.ping())
      .then(res => {
        expect(res).toEqual({})
        done()
        return broker.stop()
      })
  })
  it('should return an empty object if no nodes are connected.', done => {
    const broker = Weave({
      nodeId: 'node-ping2',
      logger: {
        enabled: false
      },
      transport: {
        adapter: 'dummy'
      }
    })

    broker.start()
      .then(() => broker.ping())
      .then(res => {
        expect(res).toEqual({})
        done()
        return broker.stop()
      })
  })

  it('should return results of all connected nodes.', done => {
    const broker1 = Weave({
      nodeId: 'node-ping3',
      logger: {
        enabled: false
      },
      transport: {
        adapter: 'dummy'
      }
    })

    const broker2 = Weave({
      nodeId: 'node-ping4',
      logger: {
        enabled: false
      },
      transport: {
        adapter: 'dummy'
      }
    })

    Promise.all([
      broker1.start(),
      broker2.start()
    ])
      .then(() => broker1.ping())
      .then(res => {
        expect(res['node-ping4']).toBeDefined()
        expect(res['node-ping4'].timeDiff).toBeDefined()
        expect(res['node-ping4'].elapsedTime).toBeLessThan(5)
        expect(res['node-ping4'].nodeId).toBe('node-ping4')
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
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    })

    const broker2 = Weave({
      nodeId: 'node2',
      logger: {
        enabled: false,
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    })

    Promise.all([
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
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    })

    const broker2 = Weave({
      nodeId: 'node2',
      logger: {
        enabled: false,
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    })

    Promise.all([
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
  it('should return results of all connected nodes.', (done) => {
    const broker1 = Weave({
      nodeId: 'node-ping41',
      logger: {
        enabled: false,
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    })

    const broker2 = Weave({
      nodeId: 'node-ping42',
      logger: {
        enabled: false,
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    })

    Promise.all([
      broker1.start(),
      broker2.start()
    ])
      .then(() => broker1.ping('node-ping42'))
      .then(res => {
        expect(res.elapsedTime).toBeLessThan(5)
        expect(res.timeDiff).toBeDefined()
        expect(res.nodeId).toBe('node-ping42')
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
        enabled: true,
        level: 'fatal'
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
    const exitMock = jest.spyOn(process, 'exit').mockImplementation((number) => number)

    broker.fatalError('Throw some fatal error', new Error('Absolutly fatal'))
    expect(exitMock).toHaveBeenCalledWith(ERROR_CODE)
    exitMock.mockRestore()
  })
})

describe('Test broker context chaining', () => {
  const broker = Weave({
    nodeId: 'node1',
    logger: {
      enabled: false,
      level: 'fatal'
    }
  })

  broker.createService({
    name: 'post',
    actions: {
      before (context) {
        const flow = [{ requestId: context.requestId, contextId: context.id, parentId: context.parentId }]
        return context.call('post.before2', { flow })
      },
      before2 (context) {
        context.data.flow.push({ requestId: context.requestId, contextId: context.id, parentId: context.parentId })
        return context.call('post.find')
      },
      find: jest.fn(context => context)
    }
  })

  beforeAll(() => broker.start())
  afterAll(() => broker.stop())

  it('level should be = 1', () => {
    return broker.call('post.find').then(context => {
      expect(context.id).toBeDefined()
      expect(context.level).toBe(1)
      expect(context.id).toEqual(context.requestId)
      expect(context.parentContext).toBe(null)
    })
  })

  it('should increment level on chained calls', () => {
    return broker.call('post.before').then(context => {
      expect(context.id).toBeDefined()
      expect(context.level).toBe(3)
      expect(context.id).not.toEqual(context.requestId)
      expect(context.options.parentContext.parentId).toEqual(context.requestId)
      expect(context.parentContext).toBe(null)
    })
  })
})

describe('Test maxCallLevel', () => {
  const broker = Weave({
    nodeId: 'node1',
    logger: {
      enabled: false,
      level: 'fatal'
    },
    registry: {
      maxCallLevel: 1
    }
  })

  broker.createService({
    name: 'post',
    actions: {
      before (context) {
        const flow = [{ requestId: context.requestId, contextId: context.id, parentId: context.parentId }]
        return context.call('post.before2', { flow })
      },
      before2 (context) {
        context.data.flow.push({ requestId: context.requestId, contextId: context.id, parentId: context.parentId })
        return context.call('post.find')
      },
      find: jest.fn(context => context)
    }
  })

  beforeAll(() => broker.start())
  afterAll(() => broker.stop())

  it('level should be = 1', () => {
    return broker.call('post.find').then(context => {
      expect(context.id).toBeDefined()
      expect(context.level).toBe(1)
      expect(context.id).toEqual(context.requestId)
      expect(context.parentContext).toBe(null)
    })
  })

  it('should increment level on chained calls', () => {
    return broker.call('post.before')
      .catch(error => {
        expect(error.message).toBe('Request level has reached the limit (1) on node "node1".')
      })
  })
})

describe('Error handler', () => {
  const errorHandler = jest.fn()

  const broker = Weave({
    nodeId: 'node1',
    errorHandler: errorHandler
  })

  broker.createService({
    name: 'test',
    actions: {
      callAndThrowError (context) {
        throw new Error('Something went wrong')
      }
    }
  })
  it('should call the global error handler', () => {
    return broker.start()
      .then(() => {
        return broker.call('test.callAndThrowError')
          .then(() => {
            expect(errorHandler).toBeCalled()
          })
          // .catch((error) => {
          //   expect(error.message).toBe('Something went wrongs')
          //   done()
          // })
      })
  })
})

describe('Error handler', () => {
  const broker = Weave({
    nodeId: 'node1',
    logger: {
      enabled: false
    }
  })

  broker.createService({
    name: 'test',
    actions: {
      callAndThrowError (context) {
        throw new Error('Something went wrong')
      }
    }
  })
  it('should call the global error handler', () => {
    return broker.start()
      .then(() => {
        return broker.call('test.callAndThrowError')
          .catch((error) => {
            expect(error.message).toBe('Something went wrong')
          })
      })
  })
})

describe('Streaming (lokal)', () => {
  const broker = Weave({
    nodeId: 'node-local-streaming',
    logger: {
      enabled: false
    }
  })

  it('should handle local streaming', async () => {
    broker.createService({
      name: 'file',
      actions: {
        write (context) {
          expect(context.stream).toBeDefined()
        }
      }
    })

    await broker.start()

    broker.call('file.write', {}, { stream: new Readable() })
  })

  it('should handle local streaming', async () => {
    broker.createService({
      name: 'file',
      actions: {
        write (context) {
          expect(context.stream).toBeDefined()
        }
      }
    })

    await broker.start()

    try {
      broker.call('file.write', {}, { stream: 'wrong type' })
    } catch (error) {
      expect(error.message).toBe('No valid stream.')
    }
  })
})

// describe('Streaming (lokal)', () => {
//   it('should handle local streaming', async (done) => {
//     const broker = Weave({
//       nodeId: 'node1',
//       logger: {
//         enabled: false
//       }
//     })

//     broker.createService({
//       name: 'file',
//       actions: {
//         write (context) {
//           expect(context.stream).toBeDefined()
//           done()
//         }
//       }
//     })

//     await broker.start()

//     broker.call('file.write', {}, { stream: new Readable() })

//     await broker.stop()
//   })

//   it('should handle local streaming', async (done) => {
//     const broker = Weave({
//       nodeId: 'node1',
//       logger: {
//         enabled: false
//       }
//     })

//     broker.createService({
//       name: 'file',
//       actions: {
//         write (context) {
//           // expect(context.stream).toBeDefined()
//         }
//       }
//     })

//     await broker.start()

//     try {
//       broker.call('file.write', {}, { stream: 'wrong type' })
//     } catch (error) {
//       expect(error.message).toBe('No valid stream.')
//       await broker.stop()
//       done()
//     }
//   })
// })

describe('Streaming (remote)', () => {
  const broker1 = Weave({
    nodeId: 'node1-remote-streaming',
    transport: {
      adapter: 'dummy'
    },
    logger: {
      enabled: false
    }
  })

  const broker2 = Weave({
    nodeId: 'node2-remote-streaming',
    transport: {
      adapter: 'dummy'
    },
    logger: {
      enabled: false
    }
  })

  it('should handle local streaming', async () => {
    broker1.createService({
      name: 'file',
      actions: {
        write (context) {
          expect(context.stream).toBeDefined()
        }
      }
    })

    await Promise.all([broker1.start(), broker2.start()])

    await broker2.call('file.write', {}, { stream: new Readable({ read () {} }) })

    await Promise.all([broker1.start(), broker2.start()])
  })
})

describe('Multiple action calls', () => {
  it('should call multiple actions', () => {

  })
})
