const { createDefaultLogger } = require('../../lib/logger/index')
const os = require('os')
const lolex = require('@sinonjs/fake-timers')
const { createConsoleLogTransport } = require('../../lib/logger/transports/console')

describe('Test logger module.', () => {
  let clock
  beforeAll(() => {
    clock = lolex.install()
  })

  afterAll(() => {
    clock.uninstall()
  })

  it('no output stream defined. It should prompt an console error.', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const logger = createDefaultLogger()
    logger.info('test')
    expect(consoleErrorSpy).toBeCalledTimes(1)
    expect(consoleErrorSpy.mock.calls[0]).toEqual(['Attempt to write logs with no transports %j', { message: 'test', level: 'info', meta: {}}])

    consoleErrorSpy.mockReset()
  })

  it('Simple console transport', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const consoleStdOutSpy = jest.spyOn(console._stdout, 'write').mockImplementation(() => {})

    const logger = createDefaultLogger({
      streams: createConsoleLogTransport()
    })

    logger.info('test')

    expect(consoleErrorSpy).toBeCalledTimes(0)

    if (console._stdout) {
      expect(consoleStdOutSpy).toBeCalledTimes(1)
      expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"message":"test","level":"info","meta":{}}' + os.EOL])
    } else {
      expect(consoleLogSpy).toBeCalledTimes(1)
      expect(consoleLogSpy.mock.calls[0]).toEqual(['{"message":"test","level":"info","meta":{}}'])
    }

    consoleStdOutSpy.mockReset()
    consoleLogSpy.mockReset()
    consoleErrorSpy.mockReset()
  })

  it('Should log types', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const consoleStdOutSpy = jest.spyOn(console._stdout, 'write').mockImplementation(() => {})

    const logger = createDefaultLogger({
      streams: createConsoleLogTransport()
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

    expect(consoleErrorSpy).toBeCalledTimes(0)

    if (console._stdout) {
      expect(consoleStdOutSpy).toBeCalledTimes(2)
      expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"message":["item1","item2"],"level":"info","meta":{}}' + os.EOL])
      expect(consoleStdOutSpy.mock.calls[1]).toEqual(['{"message":{"user":"hans","rooms":[1,2,3,4],"lastLogin":"2021-03-31T13:41:01.210Z","settings":{"app":{"darkMode":true,"lang":"de"}}},"level":"info","meta":{}}' + os.EOL])
    } else {
      expect(consoleLogSpy).toBeCalledTimes(1)
      expect(consoleLogSpy.mock.calls[0]).toEqual(['{"message":["item1","item2"],"level":"info","meta":{}}'])
    }
    consoleStdOutSpy.mockReset()
    consoleLogSpy.mockReset()
    consoleErrorSpy.mockReset()
  })

  it('Should log multiple messages', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const consoleStdOutSpy = jest.spyOn(console._stdout, 'write').mockImplementation(() => {})

    const logger = createDefaultLogger({
      streams: createConsoleLogTransport()
    })

    logger.info('message1', 'message2')

    expect(consoleErrorSpy).toBeCalledTimes(0)

    if (console._stdout) {
      expect(consoleStdOutSpy).toBeCalledTimes(1)
      expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"level":"info","message":"message1","splat":["message2"],"meta":{}}' + os.EOL])
    } else {
      expect(consoleLogSpy).toBeCalledTimes(1)
      expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"level":"info","message":"message1","splat":["message2"],"meta":{}}' + os.EOL])
    }
    consoleStdOutSpy.mockReset()
    consoleLogSpy.mockReset()
    consoleErrorSpy.mockReset()
  })

  it('Should log multiple messages', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const consoleStdOutSpy = jest.spyOn(console._stdout, 'write').mockImplementation(() => {})

    const logger = createDefaultLogger({
      streams: createConsoleLogTransport()
    })

    logger.info({ part1: 'message1', part2: 'message2' })

    expect(consoleErrorSpy).toBeCalledTimes(0)

    if (console._stdout) {
      expect(consoleStdOutSpy).toBeCalledTimes(1)
      expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"message":{"part1":"message1","part2":"message2"},"level":"info","meta":{}}' + os.EOL])
    } else {
      expect(consoleLogSpy).toBeCalledTimes(1)
      expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"message":{"part1":"message1","part2":"message2"},"level":"info","meta":{}}' + os.EOL])
    }
    consoleStdOutSpy.mockReset()
    consoleLogSpy.mockReset()
    consoleErrorSpy.mockReset()
  })

  // it('Should log error messages', (done) => {
  //   const logError = new Error('This is a test error')

  //   const customFormat = format(({ info }) => {
  //     expect(info.level).toBe('info')
  //     expect(info.message).toBe(logError.message)
  //     done()
  //   })

  //   const logger = createDefaultLogger({
  //     streams: createConsoleLogTransport({ format: customFormat })
  //   })

  //   logger.info(logError)
  // })
})
