const { Weave } = require('../../../lib/index')
const FakeTimers = require('@sinonjs/fake-timers')

describe('Cache system', () => {
  let clock
  let node1
  beforeEach(() => {
    clock = FakeTimers.install()

    node1 = Weave({
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

  it('should return a new result because the cached value is expired. (check in exoiration timer)', (done) => {
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

describe('Cache system with cache lock', () => {
  let clock
  let node1
  beforeEach(() => {
    clock = FakeTimers.install()

    node1 = Weave({
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

  it('should return a new result because the cached value is expired. (check in exoiration timer)', (done) => {
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
