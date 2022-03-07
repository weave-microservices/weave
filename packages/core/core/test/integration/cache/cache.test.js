const FakeTimers = require('@sinonjs/fake-timers')
const { createNode } = require('../../helper')

describe('Cache system', () => {
  let clock
  let node1
  beforeEach(() => {
    clock = FakeTimers.install()

    node1 = createNode({
      nodeId: 'node1',
      logger: {
        enabled: false
      },
      cache: {
        enabled: true
      },
      metrics: {
        enabled: true
      }
    })

    node1.createService({
      name: 'testService',
      actions: {
        cachedAction: {
          cache: {
            keys: ['text']
          },
          handler (context) {
            this.counter = this.counter + 1
            return context.data.text.split('').reverse().join('') + this.counter
          }
        },
        notCachedAction: {
          handler (context) {
            this.counter = this.counter + 1
            return context.data.text.split('').reverse().join('') + this.counter
          }
        },
        cachedMultiParam: {
          params: {
            firstname: 'string',
            lastname: { type: 'string', optional: true }
          },
          cache: {
            keys: ['firstname', 'lastname']
          },
          handler (context) {
            this.counter = this.counter + 1
            return `Hello ${context.data.firstname} ${context.data.lastname}! ${this.counter}`
          }
        }
      },
      created () {
        this.counter = 0
      }
    })

    node1.start()
  })
  afterEach(() => {
    node1.stop()
    clock.uninstall()
  })

  it('should return a cached result', (done) => {
    node1.waitForServices(['testService'])
      .then(() => {
        node1.call('testService.cachedAction', { text: 'hello user' })
          .then(result => {
            // reverse text + internal counter number
            expect(result).toBe('resu olleh1')
            node1.call('testService.cachedAction', { text: 'hello user' })
              .then(result => {
                expect(result).toBe('resu olleh1')
                node1.stop()
                done()
              })
          })
      })
  })

  it('should return a new result because the cached value is expired. (check in get function)', (done) => {
    node1.waitForServices(['testService'])
      .then(() => {
        node1.call('testService.cachedAction', { text: 'hello user' })
          .then(result => {
            expect(result).toBe('resu olleh1')
            clock.tick(5000)
            node1.call('testService.cachedAction', { text: 'hello user' })
              .then(result => {
                expect(result).toBe('resu olleh2')
                node1.stop()
                done()
              })
          })
      })
  })

  it('should return a new result because the cached value is expired. (check in expiration timer)', (done) => {
    node1.waitForServices(['testService'])
      .then(() => {
        node1.call('testService.cachedAction', { text: 'hello user' })
          .then(result => {
            expect(result).toBe('resu olleh1')
            clock.tick(6000)
            node1.call('testService.cachedAction', { text: 'hello user' })
              .then(result => {
                expect(result).toBe('resu olleh2')
                node1.stop()
                done()
              })
          })
      })
  })

  it('should work with uncached actions', async () => {
    await node1.waitForServices(['testService'])
    const promise = node1.call('testService.notCachedAction', { text: 'hello user' })
    const result = await promise
    expect(result).toBe('resu olleh1')
    // cache is disabled, so "isCachedResult" is undefined.
    expect(promise.context.isCachedResult).toBeUndefined()
  })

  it('should work with multiple keys', async () => {
    await node1.waitForServices(['testService'])
    const promise = node1.call('testService.cachedMultiParam', { firstname: 'Donald', lastname: 'Duck' })
    const result = await promise
    expect(result).toBe('Hello Donald Duck! 1')
    // cache is disabled, so "isCachedResult" is undefined.
    expect(promise.context.isCachedResult).toBeFalsy()

    const promise2 = node1.call('testService.cachedMultiParam', { firstname: 'Donald', lastname: 'Duck' })
    const result2 = await promise
    expect(result2).toBe('Hello Donald Duck! 1')

    // Result is cached, so "isCachedResult" is true.
    expect(promise2.context.isCachedResult).toBeTruthy()

    // try to change the order
    const promise3 = node1.call('testService.cachedMultiParam', { lastname: 'Duck', firstname: 'Donald' })
    const result3 = await promise
    expect(result3).toBe('Hello Donald Duck! 1')
    // Result is cached, so "isCachedResult" is true.
    expect(promise3.context.isCachedResult).toBeTruthy()
  })

  it('should work with optional keys', async () => {
    await node1.waitForServices(['testService'])
    const promise = node1.call('testService.cachedMultiParam', { firstname: 'Donald' })
    const result = await promise
    expect(result).toBe('Hello Donald undefined! 1')
    // cache is disabled, so "isCachedResult" is undefined.
    expect(promise.context.isCachedResult).toBeFalsy()
  })
})

describe('Cache system with cache lock', () => {
  let clock
  let node1
  beforeEach(() => {
    clock = FakeTimers.install()

    node1 = createNode({
      nodeId: 'node1',
      logger: {
        enabled: false
      },
      cache: {
        enabled: true,
        lock: {
          enabled: true
        }
      },
      metrics: {
        enabled: true
      }
    })

    node1.createService({
      name: 'testService',
      actions: {
        cachedAction: {
          cache: {
            keys: ['text']
          },
          handler (context) {
            this.counter = this.counter + 1
            return context.data.text.split('').reverse().join('') + this.counter
          }
        }
      },
      created () {
        this.counter = 0
      }
    })

    node1.start()
  })
  afterEach(() => {
    node1.stop()
    clock.uninstall()
  })

  it('should return a cached result', (done) => {
    node1.waitForServices(['testService'])
      .then(() => {
        node1.call('testService.cachedAction', { text: 'hello user' })
          .then(result => {
            expect(result).toBe('resu olleh1')
            node1.call('testService.cachedAction', { text: 'hello user' })
              .then(result => {
                expect(result).toBe('resu olleh1')
                node1.stop()
                done()
              })
          })
      })
  })

  it('should return a new result because the cached value is expired. (check in get function)', (done) => {
    node1.waitForServices(['testService'])
      .then(() => {
        node1.call('testService.cachedAction', { text: 'hello user' })
          .then(result => {
            expect(result).toBe('resu olleh1')
            clock.tick(5000)
            node1.call('testService.cachedAction', { text: 'hello user' })
              .then(result => {
                expect(result).toBe('resu olleh2')
                node1.stop()
                done()
              })
          })
      })
  })

  it('should return a new result because the cached value is expired. (check in expiration timer)', (done) => {
    node1.waitForServices(['testService'])
      .then(() => {
        node1.call('testService.cachedAction', { text: 'hello user' })
          .then(result => {
            expect(result).toBe('resu olleh1')
            clock.tick(6000)
            node1.call('testService.cachedAction', { text: 'hello user' })
              .then(result => {
                expect(result).toBe('resu olleh2')
                node1.stop()
                done()
              })
          })
      })
  })
})
