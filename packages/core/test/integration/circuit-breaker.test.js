const { Weave, TransportAdapters } = require('../../lib/index')
const { WeaveError } = require('../../lib/errors')
const lolex = require('lolex')

describe('Test circuit breaker', () => {
    let clock
    const node1 = Weave({
        nodeId: 'node1',
        logLevel: 'fatal',
        transport: {
            adapter: TransportAdapters.Fake()
        },
        circuitBreaker: {
            enabled: true,
            failureOnError: true,
            failureOnTimeout: true,
            maxFailures: 3
        }
    })

    const node2 = Weave({
        nodeId: 'node2',
        logLevel: 'fatal',
        transport: {
            adapter: TransportAdapters.Fake()
        }
    })

    node2.createService({
        name: 'test',
        actions: {
            good () {
                return 'Everthing is fine.'
            },
            bad (context) {
                if (context.params.error !== true) {
                    return Promise.reject(new WeaveError('No Permission', 666))
                } else {
                    return 'ok'
                }
            },
            ugly () {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        return resolve('OK')
                    }, 2000)
                })
            }
        }
    })

    beforeAll(() => {
        return node1.start()
            .then(() => node2.start())
            .then(() => {
                clock = lolex.install()
            })
    })

    afterAll(() => {
        return node1.stop()
            .then(() => node2.stop())
            .then(() => clock.uninstall())
    })

    it('Should call test.good 5 times without problems', () => {
        return node1.call('test.good')
            .then(() => node1.call('test.good'))
            .then(() => node1.call('test.good'))
            .then(() => node1.call('test.good'))
            .then(() => node1.call('test.good'))
            .then(() => node1.call('test.good'))
            .then(res => expect(res).toBe('Everthing is fine.'))
    })

    it('Should throw error', () => {
        return node1.call('test.bad')
            .catch(error => {
                expect(error.name).toBe('WeaveError')
                return node1.call('test.bad')
            })
            .catch(error => {
                expect(error.name).toBe('WeaveError')
                return node1.call('test.bad')
            })
            .catch(error => {
                expect(error.name).toBe('WeaveError')
                return node1.call('test.bad')
            })
            .catch(error => {
                expect(error.name).toBe('WeaveServiceNotFoundError')
                return 'ok'
            })
            .then(result => expect(result).toBe('ok'))
    })

    it('Should switch from half open to open', () => {
        clock.tick(11000)
        return node1.call('test.bad')
            .catch(error => {
                expect(error.name).toBe('WeaveError')
                return node1.call('test.bad')
            })
            .catch(error => {
                expect(error.name).toBe('WeaveServiceNotFoundError')
                return 'ok'
            })
            .then(result => expect(result).toBe('ok'))
    })

    it('Should switch from half-open to close', () => {
        clock.tick(11000)
        return node1.call('test.bad', { error: true })
            .then(result => expect(result).toBe('ok'))
    })
})
