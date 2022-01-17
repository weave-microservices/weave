const lolex = require('@sinonjs/fake-timers')
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

  it('should log with prefix and suffix', () => {
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
