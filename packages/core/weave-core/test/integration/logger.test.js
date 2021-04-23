const os = require('os')
const { Weave } = require('../../lib/index')
const lolex = require('@sinonjs/fake-timers')

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
  let clock
  beforeAll(() => {
    clock = lolex.install()
  })

  afterAll(() => {
    clock.uninstall()
  })

  it('should log through console trans', () => {
    const consoleSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => {})

    Weave({
      nodeId: 'loggerNode',
      logger: {
        base: {
          pid: 0
        }
      }
    })

    const calls = [
      ['{"level":30,"time":0,"pid":0,"nodeId":"loggerNode","moduleName":"WEAVE","msg":"Initializing #weave node version 0.9.0-beta.5"}' + os.EOL],
      ['{"level":30,"time":0,"pid":0,"nodeId":"loggerNode","moduleName":"WEAVE","msg":"Node Id: loggerNode"}' + os.EOL]
    ]

    consoleSpy.mock.calls.forEach((arg, i) => {
      expect(arg).toEqual(calls[i])
    })

    consoleSpy.mockReset()
  })
})
