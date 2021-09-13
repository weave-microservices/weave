const { createLogger } = require('../../lib/logger/index')
const os = require('os')
const lolex = require('@sinonjs/fake-timers')
const { Writable } = require('stream')
const tty = require('tty')
const { stripAnsi } = require('../helper/strip-ansi')

const stripMessages = (messages) => messages.map((message) => stripAnsi(message[0]))

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

    if (tty.isatty(0)) {
      const strippedMessage = stripAnsi(consoleStdOutSpy.mock.calls[0][0])
      expect(strippedMessage).toEqual('INFO [1970-01-01T00:00:00.000Z]  test' + os.EOL)
    } else {
      expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"level":4,"time":0,"service":"test","version":1,"message":"test"}' + os.EOL])
    }
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
    if (tty.isatty(0)) {
      const strippedMessage = stripMessages(consoleStdOutSpy.mock.calls)
      expect(strippedMessage[0]).toEqual('INFO [1970-01-01T00:00:00.000Z] \n{\n  "0": "item1",\n  "1": "item2"\n}' + os.EOL)
      expect(strippedMessage[1]).toEqual('INFO [1970-01-01T00:00:00.000Z] \n{\n  "user": "hans",\n  "rooms": [\n    1,\n    2,\n    3,\n    4\n  ],\n  "lastLogin": "2021-03-31T13:41:01.210Z",\n  "settings": {\n    "app": {\n      "darkMode": true,\n      "lang": "de"\n    }\n  }\n}' + os.EOL)
    } else {
      expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"0":"item1","1":"item2","level":4,"time":0,"service":"test","version":1}' + os.EOL])
      expect(consoleStdOutSpy.mock.calls[1]).toEqual(['{"level":4,"time":0,"service":"test","version":1,"user":"hans","rooms":[1,2,3,4],"lastLogin":"2021-03-31T13:41:01.210Z","settings":{"app":{"darkMode":true,"lang":"de"}}}' + os.EOL])
    }

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
    if (tty.isatty(0)) {
      const strippedMessage = stripMessages(consoleStdOutSpy.mock.calls)
      expect(strippedMessage[0]).toEqual('INFO [1970-01-01T00:00:00.000Z]  message1 message2' + os.EOL)
    } else {
      expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"level":4,"time":0,"service":"test","version":1,"message":"message1 message2"}' + os.EOL])
    }
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
    if (tty.isatty(0)) {
      const strippedMessage = stripMessages(consoleStdOutSpy.mock.calls)
      expect(strippedMessage[0]).toEqual('FATAL [1970-01-01T00:00:00.000Z]  Fatal error' + os.EOL)
    } else {
      expect(consoleStdOutSpy.mock.calls[0]).toEqual(['{"level":1,"time":0,"service":"test","version":1,"message":"Fatal error"}' + os.EOL])
    }
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
    const error = new Error('Fatal error')
    error.stack = 'Here could be your stack!'
    logger.fatal(error, 'override message')
    if (tty.isatty(0)) {
      const strippedMessage = stripMessages(consoleStdOutSpy.mock.calls)
      expect(strippedMessage[0]).toEqual('FATAL [1970-01-01T00:00:00.000Z]  override message\n{\n  "stack": "Here could be your stack!",\n  "type": "Error"\n}' + os.EOL)
    } else {
      const logObj = JSON.parse(consoleStdOutSpy.mock.calls[0])
      expect(consoleStdOutSpy).toBeCalledTimes(1)
      expect(logObj.level).toBe(1)
      expect(logObj.message).toBe('override message')
      expect(logObj.stack).toBe('Here could be your stack!')
      expect(logObj.type).toBe('Error')
      expect(logObj.time).toBe(0)
    }

    consoleStdOutSpy.mockReset()
  })
})
