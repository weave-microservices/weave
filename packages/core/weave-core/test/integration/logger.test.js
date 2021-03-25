const { Weave } = require('../../lib/index')
const { createConsoleLogTransport } = require('../../lib/logger/transports/console')

const lolex = require('@sinonjs/fake-timers')
// const Stream = require('./helper/TestStream')

describe('Test logger module.', () => {
  let clock
  beforeAll(() => {
    clock = lolex.install()
  })

  afterAll(() => {
    clock.uninstall()
  })

  it('should disable logger if logger is set to null.', () => {
    const broker = Weave({
      logger: null
    })

    expect(broker.options.logger.enabled).toBe(false)
  })

  it('should provide default log methods.', () => {
    const broker = Weave({
      logger: {
        enabled: false,
        logLevel: 'fatal'
      }
    })

    expect(broker.log.log).toBeDefined()
    expect(broker.log.info).toBeDefined()
    expect(broker.log.success).toBeDefined()
    expect(broker.log.progress).toBeDefined()
    expect(broker.log.debug).toBeDefined()
    expect(broker.log.trace).toBeDefined()
    expect(broker.log.error).toBeDefined()
    expect(broker.log.fatal).toBeDefined()
    expect(broker.log.warn).toBeDefined()
    expect(broker.log.wait).toBeDefined()
    expect(broker.log.complete).toBeDefined()
    expect(broker.log.note).toBeDefined()
    expect(broker.log.star).toBeDefined()
    expect(broker.log.fav).toBeDefined()
  })

  it('should call done hook of a custom log type. (4 times "info" on weave startup)', (done) => {
    const doneHookFn = jest.fn()
    const broker = Weave({
      nodeId: 'node1',
      logger: {
        logLevel: 'info',
        types: {
          info: {
            done: doneHookFn
          }
        }
      }
    })

    broker.start()
      .then(() => {
        expect(doneHookFn).toBeCalledTimes(3)
        done()
      })
      .then(() => clock.uninstall())
      .then(() => broker.stop())
  })

  it('should log with prefix and suffix', (done) => {
    const doneHookFn = jest.fn()
    const broker = Weave({
      nodeId: 'node1',
      logger: {
        logLevel: 'fatal',
        types: {
          info: {
            done: doneHookFn
          }
        }
      }
    })

    broker.start()
      .then(() => {
        broker.log.info({ prefix: 'TEST', message: 'Hello' })
        done()
      })
      .then(() => clock.uninstall())
      .then(() => broker.stop())
  })
})

describe.only('Test logger transporter streams.', () => {
  const consoleSpy = jest.spyOn(console, 'log')
  it.only('should log through console trans', () => {
    const broker = Weave({
      logger: {
        streams: createConsoleLogTransport({ level: 'error' })
      }
    })

    expect(consoleSpy).toHaveBeenCalledWith('[2021-03-25T11:17:18.762Z] › ℹ   info      [Kevins-iMac-Pro.fritz.box-48649/WEAVE] Initializing #weave node version 0.8.2')
    expect(consoleSpy).toHaveBeenCalledWith('')
  })
})
