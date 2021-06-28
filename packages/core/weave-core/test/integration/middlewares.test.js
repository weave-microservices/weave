const { Weave, TransportAdapters } = require('../../lib/index')

describe('Middleware hooks', () => {
  it('should call hooks in the right order', (done) => {
    const order = []

    const middleware = {
      starting: () => {
        order.push('starting')
      },
      started: () => {
        order.push('started')
      },
      stopping: () => {
        order.push('stopping')
      },
      stopped: () => {
        order.push('stopped')
      }
    }

    const broker = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      },
      middlewares: [middleware]
    })

    broker.start()
      .then(() => broker.stop())
      .then(() => {
        expect(order.join('-')).toBe('starting-started-stopping-stopped')
        done()
      })
  })

  it('should call hooks in the right order (with service hooks)', (done) => {
    const order = []

    const middleware = {
      starting: () => {
        order.push('starting')
      },
      started: () => {
        order.push('started')
      },
      serviceCreating: function () {
        order.push('serviceCreating')
      },
      serviceCreated: function () {
        order.push('serviceCreated')
      },
      serviceStarting: () => {
        order.push('serviceStarting')
      },
      serviceStarted: () => {
        order.push('serviceStarted')
      },
      serviceStopping: () => {
        order.push('serviceStopping')
      },
      serviceStopped: () => {
        order.push('serviceStopped')
      },
      stopping: () => {
        order.push('stopping')
      },
      stopped: () => {
        order.push('stopped')
      },
      localAction: (handler, a) => {
        return function (context) {
          order.push('localAction1')
          return handler(context).then(res => {
            order.push('localAction2')
            return res
          })
        }
      },
      emit (next) {
        return (event, payload) => {
          order.push('emit')
          return next(event, payload)
        }
      },
      broadcast (next) {
        return (event, payload) => {
          order.push('broadcast')
          return next(event, payload)
        }
      }
    }

    const broker = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      },
      loadNodeService: false,
      middlewares: [middleware]
    })

    broker.createService({
      name: 'testService',
      actions: {
        test (context) {
          context.emit('hihi')
          context.broadcast('hoho')
          return true
        }
      }
    })

    broker.start()
      .then(() => broker.call('testService.test'))
      .then(() => broker.stop())
      .then(() => {
        expect(order.join('-'))
          .toBe('serviceCreating-serviceCreated-starting-serviceStarting-serviceStarted-started-localAction1-emit-broadcast-localAction2-stopping-serviceStopping-serviceStopped-stopped')
        done()
      })
  })

  it('should call local action hook', (done) => {
    const middleware = {
      localAction: function (handler) {
        return context => {
          context.data.paramFromMiddleware = 'hello world'
          return handler(context)
        }
      }
    }

    const broker = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false,
        level: 'fatal'
      },
      loadNodeService: false,
      middlewares: [middleware]
    })

    broker.createService({
      name: 'testService',
      actions: {
        helloWorld (context) {
          return context.data
        }
      }
    })

    broker.start()
      .then(() => {
        return broker.call('testService.helloWorld')
          .then(res => {
            expect(res.paramFromMiddleware).toBe('hello world')
            done()
          })
      })
  })

  it('should call remote action hook', (done) => {
    const middleware = {
      remoteAction: function (handler) {
        return context => {
          context.data.paramFromMiddleware = 'hello world'
          return handler(context)
        }
      }
    }

    const broker1 = Weave({
      nodeId: 'node1',
      transport: {
        adapter: TransportAdapters.Dummy()
      },
      logger: {
        enabled: false
      },
      loadNodeService: false,
      middlewares: [middleware]
    })

    const broker2 = Weave({
      nodeId: 'node2',
      transport: {
        adapter: TransportAdapters.Dummy()
      },
      logger: {
        enabled: false
      },
      loadNodeService: false
    })

    broker2.createService({
      name: 'math',
      actions: {
        add (context) {
          return { params: context.data, result: Number(context.data.a) + Number(context.data.b) }
        }
      }
    })

    return Promise.all([
      broker1.start(),
      broker2.start()
    ])
      .then(() => broker1.waitForServices(['math']))
      .then(() => {
        return broker1.call('math.add', { a: 1, b: 2 })
          .then(res => {
            expect(res.result).toBe(3)
            expect(res.params.paramFromMiddleware).toBe('hello world')
            done()
          })
      })
  })

  it('should decorate core module', () => {
    const middleware = {
      created (runtime) {
        runtime.broker.fancyTestmethod = () => {}
      }
    }

    const broker1 = Weave({
      nodeId: 'node1',

      logger: {
        enabled: false
      },
      loadNodeService: false,
      middlewares: [middleware]
    })

    broker1.start()
    expect(broker1.fancyTestmethod).toBeDefined()
  })
})

describe('Service creating hook', () => {
  it('should modify the given service schema', (done) => {
    const middleware = {
      serviceCreating: (_, schema) => {
        if (!schema.methods) {
          schema.methods = {}
        }
        schema.methods.pull = () => {
          return 'return pull'
        }
      }
    }

    const broker = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      },
      middlewares: [middleware]
    })

    broker.createService({
      name: 'testService',
      actions: {
        callPull () {
          // call hook injected method.
          return this.pull()
        }
      }
    })

    broker.start()
      .then(() => {
        return broker.call('testService.callPull')
          .then(res => {
            expect(res).toBe('return pull')
            done()
          })
      })
  })
})
