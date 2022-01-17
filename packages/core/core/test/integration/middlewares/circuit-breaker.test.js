const { TransportAdapters } = require('../../../lib/index')
const { WeaveError } = require('../../../lib/errors')
const { createNode } = require('../../helper')

describe('Test circuit breaker', () => {
  const node1 = createNode({
    nodeId: 'node1',
    logger: {
      enabled: false,
      level: 'fatal'
    },
    transport: {
      adapter: TransportAdapters.Dummy()
    },
    circuitBreaker: {
      enabled: true,
      failureOnError: true,
      failureOnTimeout: true,
      maxFailures: 3
    }
  })

  const node2 = createNode({
    nodeId: 'node2',
    logger: {
      enabled: false
    },
    transport: {
      adapter: TransportAdapters.Dummy()
    }
  })

  node2.createService({
    name: 'test',
    actions: {
      good () {
        return 'Everthing is fine.'
      },
      bad (context) {
        if (context.data.error !== true) {
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
      .then(() => jest.useFakeTimers())
  })

  afterAll(() => {
    return node1.stop()
      .then(() => node2.stop())
      .then(() => jest.useRealTimers())
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
        expect(error.name).toBe('WeaveServiceNotAvailableError')
        return 'ok'
      })
      .then(result => expect(result).toBe('ok'))
  })

  it('Should switch from half open to open', () => {
    jest.advanceTimersByTime(11000)
    return node1.call('test.bad')
      .catch(error => {
        expect(error.name).toBe('WeaveError')
        return node1.call('test.bad')
      })
      .catch(error => {
        expect(error.name).toBe('WeaveServiceNotAvailableError')
        return 'ok'
      })
      .then(result => expect(result).toBe('ok'))
  })

  it('Should switch from half-open to close', () => {
    jest.advanceTimersByTime(11000)
    return node1.call('test.bad', { error: true })
      .then(result => expect(result).toBe('ok'))
  })
})
