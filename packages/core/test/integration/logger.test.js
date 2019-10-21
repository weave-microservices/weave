const { Weave } = require('../../lib/index')
const lolex = require('lolex')
const Stream = require('./helper/TestStream')

describe('Test logger module.', () => {
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

    // it('should output the log message on stream.', (done) => {
    //     const readStream = new Stream()

    //     const broker = Weave({
    //         nodeId: 'node1',
    //         logger: {
    //             logLevel: 'trace',
    //             stream: [readStream]
    //         }
    //     })

    //     readStream.on('data', data => {

    //     })

    //     broker.start()
    //         .then(() => {
    //             const snap = readStream.getSnapshot()
    //             expect(true)
    //             broker.stop()
    //             done()
    //         })
    // })
})
