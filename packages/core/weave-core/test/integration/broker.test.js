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

describe('Test broker context chaining', () => {
  const broker = Weave({
    nodeId: 'node1',
    logger: {
      enabled: false,
      logLevel: 'fatal'
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
      logLevel: 'fatal'
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
