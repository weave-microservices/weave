const { Weave } = require('../../lib/index')
const { createConsoleLogTransport } = require('../../lib/logger/transports/console')

const lolex = require('@sinonjs/fake-timers')
// const Stream = require('./helper/TestStream')

describe('Test weave logger integration.', () => {
  let clock
  beforeAll(() => {
    clock = lolex.install()
  })

  afterAll(() => {
    clock.uninstall()
  })

  it('should provide default log methods.', () => {
    const broker = Weave({
      logger: {
        enabled: false,
        level: 'fatal'
      }
    })

    expect(broker.log.info).toBeDefined()
    expect(broker.log.debug).toBeDefined()
    expect(broker.log.verbose).toBeDefined()
    expect(broker.log.error).toBeDefined()
    expect(broker.log.warn).toBeDefined()
  })

  it('should log with prefix and suffix', (done) => {
    const doneHookFn = jest.fn()
    const broker = Weave({
      nodeId: 'node1',
      logger: {
        level: 'fatal',
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

describe('Test logger transporter streams.', () => {
  it('should log through console trans', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    Weave({
      nodeId: 'loggerNode',
      logger: {
        streams: [createConsoleLogTransport()]
      }
    })

    const calls = [
      ['Initializing #weave node version 0.8.1'],
      ['Node Id: loggerNode'],
      ['Metrics initialized.']
    ]

    consoleSpy.mock.calls.forEach((arg, i) => {
      expect(arg).toEqual(calls[i])
    })

    consoleSpy.mockReset()
  })
})
