const { createDefaultLogger } = require('../../lib/logger/index')
const os = require('os')
const lolex = require('@sinonjs/fake-timers')
const { createConsoleLogTransport } = require('../../lib/logger/transports/console')
// const Stream = require('./helper/TestStream')

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
    expect(consoleErrorSpy.mock.calls[0]).toEqual(['Attempt to write logs with no transports %j', { message: '{"message":"test"}'}])

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
      expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"message":"test"}' + os.EOL])
    } else {
      expect(consoleLogSpy).toBeCalledTimes(1)
      expect(consoleLogSpy.mock.calls[0]).toEqual(['{"message":"test"}'])
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
      expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"message":["item1","item2"]}' + os.EOL])
      expect(consoleStdOutSpy.mock.calls[1]).toEqual(['{\"message\":{\"user\":\"hans\",\"rooms\":[1,2,3,4],\"lastLogin\":\"2021-03-31T13:41:01.210Z\",\"settings\":{\"app\":{\"darkMode\":true,\"lang\":\"de\"}}}}' + os.EOL])
    } else {
      expect(consoleLogSpy).toBeCalledTimes(1)
      expect(consoleLogSpy.mock.calls[0]).toEqual(['{"message":["item1","item2"]}'])
    }
    consoleStdOutSpy.mockReset()
    consoleLogSpy.mockReset()
    consoleErrorSpy.mockReset()
  })
})

// describe('Test logger transporter streams.', () => {
//   it('should log through console trans', () => {
//     const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

//     Weave({
//       nodeId: 'loggerNode'
//     })

//     expect(consoleSpy).toBeCalledTimes(3)

//     const calls = [
//       ['Initializing #weave node version 0.8.1'],
//       ['Node Id: loggerNode'],
//       ['Metrics initialized.']
//     ]

//     consoleSpy.mock.calls.forEach((arg, i) => {
//       expect(arg).toEqual(calls[i])
//     })

//     consoleSpy.mockReset()
//   })
// })
