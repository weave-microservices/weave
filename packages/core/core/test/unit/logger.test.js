const { createLogger } = require('../../lib/logger/index')
const os = require('os')
const lolex = require('@sinonjs/fake-timers')

describe('Test logger module.', () => {
  let clock
  beforeAll(() => {
    clock = lolex.install()
  })

  afterAll(() => {
    clock.uninstall()
  })

  it('Simple console transport', () => {
    const consoleStdOutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => {})

    const logger = createLogger({
      base: {
        service: 'test',
        version: 1
      }
    })
    logger.info('test')
    expect(consoleStdOutSpy).toBeCalledTimes(1)
    expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"level":30,"time":0,"service":"test","version":1,"message":"test"}' + os.EOL])
    consoleStdOutSpy.mockReset()
  })

  // it('Simple console transport', () => {
  //   const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  //   const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  //   const consoleStdOutSpy = jest.spyOn(console._stdout, 'write').mockImplementation(() => {})

  //   const logger = createLogger({
  //     base: {
  //       service: 'test',
  //       version: 1
  //     }
  //   })

  //   logger.info('test')

  //   expect(consoleErrorSpy).toBeCalledTimes(0)

  //   if (console._stdout) {
  //     expect(consoleStdOutSpy).toBeCalledTimes(1)
  //     expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"message":"test","level":"info","meta":{}}' + os.EOL])
  //   } else {
  //     expect(consoleLogSpy).toBeCalledTimes(1)
  //     expect(consoleLogSpy.mock.calls[0]).toEqual(['{"message":"test","level":"info","meta":{}}'])
  //   }

  //   consoleStdOutSpy.mockReset()
  //   consoleLogSpy.mockReset()
  //   consoleErrorSpy.mockReset()
  // })

  it('Should log types', () => {
    const consoleStdOutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => {})

    const logger = createLogger({
      base: {
        service: 'test',
        version: 1
      }
    })

    const LogObject = {
      user: 'hans',
      rooms: [1, 2, 3, 4],
      lastLogin: new Date(1617198061210),
      settings: {
        app: {
          darkMode: true,
          lang: 'de'
        }
      }
    }

    logger.info(['item1', 'item2'])
    logger.info(LogObject)

    expect(consoleStdOutSpy).toBeCalledTimes(2)
    expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"0":"item1","1":"item2","level":30,"time":0,"service":"test","version":1}' + os.EOL])
    expect(consoleStdOutSpy.mock.calls[1]).toEqual(['{"level":30,"time":0,"service":"test","version":1,"user":"hans","rooms":[1,2,3,4],"lastLogin":"2021-03-31T13:41:01.210Z","settings":{"app":{"darkMode":true,"lang":"de"}}}' + os.EOL])

    consoleStdOutSpy.mockReset()
  })

  it('Should log multiple messages', () => {
    const consoleStdOutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => {})

    const logger = createLogger({
      base: {
        service: 'test',
        version: 1
      }
    })

    logger.info('message1 %s', 'message2')

    expect(consoleStdOutSpy).toBeCalledTimes(1)
    expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"level":30,"time":0,"service":"test","version":1,"message":"message1 message2"}' + os.EOL])
    consoleStdOutSpy.mockReset()
  })

  it('Should log fatal messages', () => {
    const consoleStdOutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => {})

    const logger = createLogger({
      base: {
        service: 'test',
        version: 1
      }
    })

    logger.fatal('Fatal error')

    expect(consoleStdOutSpy).toBeCalledTimes(1)
    expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"level":60,"time":0,"service":"test","version":1,"message":"Fatal error"}' + os.EOL])
    consoleStdOutSpy.mockReset()
  })

  it('Should log fatal errors', () => {
    const consoleStdOutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => {})

    const logger = createLogger({
      base: {
        service: 'test',
        version: 1
      }
    })

    logger.fatal(new Error('Fatal error'), 'override message')
    const logObj = JSON.parse(consoleStdOutSpy.mock.calls[0])
    expect(consoleStdOutSpy).toBeCalledTimes(1)
    expect(logObj.level).toBe(60)
    expect(logObj.message).toBe('override message')
    expect(logObj.stack).toBeDefined()
    expect(logObj.type).toBe('Error')
    expect(logObj.time).toBe(0)

    consoleStdOutSpy.mockReset()
  })
})
