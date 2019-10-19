const { Weave, TransportAdapters } = require('../../lib/index')

describe('Test middlware hooks', () => {
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
            actions: {}
        })

        broker.start()
            .then(() => broker.stop())
            .then(() => {
                expect(order.join('-')).toBe('serviceCreated-starting-serviceStarting-serviceStarted-started-stopping-serviceStopping-serviceStopped-stopped')
                done()
            })
    })

    it('should call local action hook', (done) => {
        const middleware = {
            localAction: function (handler) {
                return context => {
                    context.params.paramFromMiddleware = 'hello world'
                    return handler(context)
                }
            }
        }

        const broker = Weave({
            nodeId: 'node1',
            logger: {
                enabled: false,
                logLevel: 'fatal'
            },
            loadNodeService: false,
            middlewares: [middleware]
        })

        broker.createService({
            name: 'testService',
            actions: {
                helloWorld (context) {
                    return context.params
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
                    context.params.paramFromMiddleware = 'hello world'
                    return handler(context)
                }
            }
        }

        const broker1 = Weave({
            nodeId: 'node1',
            transport: {
                adapter: TransportAdapters.Fake()
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
                adapter: TransportAdapters.Fake()
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
                    return { params: context.params, result: Number(context.params.a) + Number(context.params.b) }
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
            created (broker) {
                broker.fancyTestmethod = () => {}
            }
        }

        const broker1 = Weave({
            nodeId: 'node1',
            transport: {
                adapter: TransportAdapters.Fake()
            },
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

