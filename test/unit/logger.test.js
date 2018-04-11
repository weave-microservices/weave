const lolex = require('lolex')
const { createDefaultLogger } = require('../../lib/logger')

function callLogMethods (logger) {
    logger.trace('trace level')
    logger.debug('debug level')
    logger.info('info level')
    logger.warn('warn level')
    logger.error('error level')
    logger.fatal('fatal level')
}

describe('Logger', () => {
    let clock

    beforeAll(() => {
        clock = lolex.install()
    })

    afterAll(() => {
        clock.uninstall()
    })

    it('should create default methods.', () => {
        const con = {
            warn: jest.fn(),
            info: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            trace: jest.fn(),
            fatal: jest.fn()
        }

        const bindings = {
            nodeId: 'TestNode',
            service: {
                name: 'test'
            }
        }
        const logger = createDefaultLogger(con, bindings, 'trace')
        callLogMethods(logger)

        expect(logger.fatal).toBeDefined()
        expect(logger.error).toBeDefined()
        expect(logger.warn).toBeDefined()
        expect(logger.info).toBeDefined()
        expect(logger.debug).toBeDefined()
        expect(logger.trace).toBeDefined()
    })

    it('should call methods and get result.', () => {
        const con = {
            warn: jest.fn(),
            info: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            trace: jest.fn(),
            fatal: jest.fn()
        }

        const bindings = {
            nodeId: 'TestNode',
            service: {
                name: 'test'
            }
        }

        const logger = createDefaultLogger(con, bindings, 'trace')
        callLogMethods(logger)

        expect(con.fatal).toHaveBeenCalledTimes(1)
        expect(con.error).toHaveBeenCalledTimes(1)
        expect(con.warn).toHaveBeenCalledTimes(1)
        expect(con.info).toHaveBeenCalledTimes(1)
        expect(con.debug).toHaveBeenCalledTimes(1)
        expect(con.trace).toHaveBeenCalledTimes(1)
    })
})
