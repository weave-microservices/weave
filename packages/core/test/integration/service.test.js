const { Weave } = require('../../lib/index')
const hasServiceScope = require('./scope-checks/service.scope')

describe('Test broker call service', () => {
    it('should call a service.', (done) => {
        const node1 = Weave({
            nodeId: 'node1',
            logger: {
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

    it('should call a service action and return a value.', () => {
        const node1 = Weave({
            nodeId: 'node1',
            logger: {
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
                })
        })
    })

    it('should call a service action and return an error.', () => {
        const node1 = Weave({
            nodeId: 'node1',
            logger: {
                logLevel: 'fatal'
            }
        })

        node1.createService({
            name: 'testService',
            actions: {
                sayHello (context) {
                    return Promise.reject(new Error('Error from testService'))
                }
            }
        })

        node1.start().then(() => {
            expect(node1.call('testService.sayHello', { name: 'Hans' }))
                .rejects.toThrow('Error')
        })
    })

    it('should call a service action and pass a meta value to a chained action.', () => {
        const node1 = Weave({
            nodeId: 'node1',
            logger: {
                logLevel: 'fatal'
            }
        })

        node1.createService({
            name: 'testService',
            actions: {
                sayHello (context) {
                    context.meta.userId = 1
                    context.call('testService2.sayHello')
                }
            }
        })

        node1.createService({
            name: 'testService2',
            actions: {
                sayHello (context) {
                    expect(context.meta.userId).toBe(1)
                }
            }
        })

        node1.start().then(() => {
            node1.call('testService.sayHello', { name: 'Hans' }, { meta: { userId: 1 }})
        })
    })
})

describe('Service lifetime hooks', () => {
    it('should call lifecycle hooks.', (done) => {
        const order = []

        const node1 = Weave({
            nodeId: 'node1',
            logger: {
                logLevel: 'fatal'
            }
        })

        node1.createService({
            name: 'testService',
            created () {
                order.push('created')
            },
            started () {
                order.push('started')
            },
            stopped () {
                order.push('stopped')
            }
        })

        node1.start().then(() => node1.stop())
            .then(() => {
                expect(order.join('-')).toBe('created-started-stopped')
                done()
            })
    })

    it('should call lifecycle hooks with correct scope. [creaded]', done => {
        const node1 = Weave({
            nodeId: 'node1',
            logger: {
                logLevel: 'fatal'
            }
        })

        node1.createService({
            name: 'testService',
            created () {
                hasServiceScope(this, done)
                done()
            }
        })

        node1.start().then(() => node1.stop())
    })

    it('should call lifecycle hooks with correct scope. [started]', done => {
        const node1 = Weave({
            nodeId: 'node1',
            logger: {
                logLevel: 'fatal'
            }
        })

        node1.createService({
            name: 'testService',
            started () {
                hasServiceScope(this, done)
                done()
            }
        })

        node1.start().then(() => node1.stop())
    })

    it('should call lifecycle hook with correct scope. [stopped]', done => {
        const node1 = Weave({
            nodeId: 'node1',
            logger: {
                logLevel: 'fatal'
            }
        })
        node1.createService({
            name: 'testService',
            stopped () {
                hasServiceScope(this, done)
                done()
            }
        })

        node1.start().then(() => node1.stop())
    })
})
