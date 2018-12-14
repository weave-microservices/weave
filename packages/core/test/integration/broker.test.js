const { Weave } = require('../../lib/index')

describe('Test broker lifecycle', () => {
    it('should verify that started hook is a fuction.', () => {
        expect(() => {
            Weave({
                nodeId: 'node1',
                logLevel: 'fatal',
                started: {}
            })
        }).toThrow('Started hook have to be a function.')
    })

    it('should verify that stopped hook is a fuction.', () => {
        expect(() => {
            Weave({
                nodeId: 'node1',
                logLevel: 'fatal',
                stopped: {}
            })
        }).toThrow('Stopped hook have to be a function.')
    })

    it('should create a broker and call the started/stopped hook.', () => {
        const startedHook = jest.fn()
        const stoppedHook = jest.fn()

        const node1 = Weave({
            nodeId: 'node1',
            logLevel: 'fatal',
            started: startedHook,
            stopped: stoppedHook
        })

        node1.start().then(() => {
            expect(startedHook).toBeCalled()

            node1.stop().then(() => {
                expect(stoppedHook).toBeCalled()
            })
        })
    })
})

describe('Test broker call service', () => {
    it('should call a service.', (done) => {
        const node1 = Weave({
            nodeId: 'node1',
            logLevel: 'fatal'
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
            logLevel: 'fatal'
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
})

describe('Test broker call error handling', () => {
    it('should call a service action and be rejected with an error.', (done) => {
        const node1 = Weave({
            nodeId: 'node1',
            logLevel: 'fatal'
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
            logLevel: 'fatal'
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
                    expect(error.message).toBe('Error from action level 1')
                    done()
                })
        })
    })
})

