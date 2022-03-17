const lolex = require('@sinonjs/fake-timers')
const { WeaveError } = require('../../lib/errors')
const { createNode } = require('../helper')

describe('Test weave logger integration.', () => {
  let clock
  beforeAll(() => {
    clock = lolex.install()
  })

  afterAll(() => {
    clock.uninstall()
  })

  it('should provide default log methods.', () => {
    const broker = createNode({
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

  it('should work with log level value.', () => {
    const broker = createNode({
      logger: {
        enabled: false,
        level: 40
      }
    })

    expect(broker.log.info).toBeDefined()
    expect(broker.log.debug).toBeDefined()
    expect(broker.log.verbose).toBeDefined()
    expect(broker.log.error).toBeDefined()
    expect(broker.log.warn).toBeDefined()
  })

  it('should use the logMethod hook', () => {
    const doneHookFn = jest.fn((args, method) => {
      return method(...args)
    })

    const broker = createNode({
      nodeId: 'node1',
      logger: {
        enabled: true,
        level: 'fatal',
        hooks: {
          logMethod: doneHookFn
        }
      }
    })

    return broker.start()
      .then(() => {
        broker.log.fatal({ prefix: 'TEST', message: 'Hello' })
        expect(doneHookFn).toBeCalledTimes(1)
      })
      .then(() => clock.uninstall())
      .then(() => broker.stop())
  })

  it('should throw an error on unknown log levels', () => {
    try {
      createNode({
        nodeId: 'node1',
        logger: {
          enabled: true,
          level: 'unknown!!!'
        }
      })
    } catch (error) {
      expect(error).toBeInstanceOf(WeaveError)
      expect(error.message).toBe('Unknown level: "unknown!!!"')
    }
  })

  it('should throw an error on unknown log levels values', () => {
    try {
      createNode({
        nodeId: 'node1',
        logger: {
          enabled: true,
          level: 110
        }
      })
    } catch (error) {
      expect(error).toBeInstanceOf(WeaveError)
      expect(error.message).toBe('Unknown level value: "110"')
    }
  })

  it('should log error objects', () => {
    const logMethod = jest.fn((args, method) => {
      return method(...args)
    })
    const broker = createNode({
      nodeId: 'node1',
      logger: {
        enabled: true,
        level: 60,
        hooks: {
          logMethod
        }
      }
    })

    return broker.start()
      .then(() => {
        broker.log.info(new Error('Error message text.'))
        expect(logMethod).toBeCalledTimes(4)
      })
  })
})



// describe('Test logger transporter streams.', () => {
//   let clock
//   beforeAll(() => {
//     clock = lolex.install()
//   })

//   afterAll(() => {
//     clock.uninstall()
//   })

//   it('should log through console trans', () => {
//     const consoleSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => {})

//     createNode({
//       nodeId: 'loggerNode',
//       logger: {
//         base: {
//           pid: 0,
//           hostname: 'my-host.com'
//         }
//       }
//     })

//     const version = pkg.version

//     const calls = [
//       [`INFO [1970-01-01T00:00:00.000Z]  Initializing #weave node version ${version}` + os.EOL],
//       ['{"level":4,"time":0,"nodeId":"loggerNode","moduleName":"WEAVE","pid":0,"hostname":"my-host.com","message":"Node Id: loggerNode"}' + os.EOL]
//     ]

//     consoleSpy.mock.calls.forEach((arg, i) => {
//       expect(arg).toEqual(calls[i])
//     })

//     consoleSpy.mockReset()
//   })
// })
