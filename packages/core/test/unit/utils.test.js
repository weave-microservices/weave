const utils = require('../../lib/utils')
const os = require('os')

describe('Test utils lib', () => {
    it('Is Object', () => {
        expect(utils.isPlainObject({})).toBe(true)
        expect(utils.isPlainObject('')).toBe(false)
    })

    it('should generate a unique uuid', () => {
        const token1 = utils.generateToken()
        expect(token1).toBeDefined()
        expect(token1.length).toBe(36)

        const token2 = utils.generateToken()
        expect(token2).toBeDefined()
        expect(token2).not.toEqual(token1)
    })

    it('should generate a node id', () => {
        const nodeId = utils.createNodeId()
        expect(nodeId).toBe(`${os.hostname()}-${process.pid}`)
    })

    it('should format bytes', () => {
        const size = utils.bytesToSize(1023)
        expect(size).toBe(`1023 Bytes`)
    })

    it('should format kilobytes', () => {
        const size = utils.bytesToSize(1024)
        expect(size).toBe(`1 KB`)
    })

    it('should format megabyte', () => {
        const size = utils.bytesToSize(1048576)
        expect(size).toBe(`1 MB`)
    })

    it('should get an IP list', () => {
        const ipList = utils.getIpList()
        expect(ipList).toBeInstanceOf(Array)
        expect(ipList.length).toBeGreaterThan(0)
    })

    it('should match patterns', () => {
        expect(utils.match('1.2.3', '1.2.3')).toBe(true)
        expect(utils.match('1.2.3.4', '1.2.3.4')).toBe(true)

        expect(utils.match('1.2.3', '1.2.*')).toBe(true)
        expect(utils.match('1.3.3', '1.2.*')).toBe(false)

        expect(utils.match('1.2.3', '1.?.3')).toBe(true)
        expect(utils.match('1.2.3', '$1.?.3')).toBe(false)

        expect(utils.match('1', '*')).toBe(true)
        expect(utils.match('11', '**')).toBe(true)

        expect(utils.match('12.45.67', '12.45.**')).toBe(true)
    })

    it('should print a deprecatet warning.', () => {
        const warnSpy = jest.spyOn(global.console, 'warn')
        utils.deprecated('test', null, false)
        expect(warnSpy)
            .toBeCalledWith('Deprecation warning: test')
    })

    // it('should print a deprecatet warning with message.', () => {
    //     const warnSpy = jest.spyOn(global.console, 'warn')
    //     utils.deprecated('test', 'Method test is deprecated.', false)
    //     expect(warnSpy)
    //         .toBeCalledWith('Deprecation warning: Method test is deprecated.')
    // })

    it('should save copy a object', () => {
        const source = {
            a: 'Hans Mustermann',
            b: {
                ba: 'aaaa',
                bb: 'bbbb',
                bc: [1, 2, 4, 5]
            },
            c: ['a', 'b', 'v'],
            d: true,
            e: (a) => {}
        }
        // circular reference
        source.b.bd = source
        const copy = utils.saveCopy(source)

        expect(copy).not.toBe(source)

        // method from source is missing
        expect(copy).toEqual({
            a: 'Hans Mustermann',
            b: {
                ba: 'aaaa',
                bb: 'bbbb',
                bc: [1, 2, 4, 5]
            },
            c: ['a', 'b', 'v'],
            d: true
        })

        expect(source.b.bd).toBeDefined()
    })

    it('shoud timeout a promise', (done) => {
        const p = new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, 1000)
        })

        const error = new Error('Timeout')
        utils.promiseTimeout(500, p, error)
            .catch(error => {
                expect(error.message).toBe('Timeout')
                done()
            })
    })

    it('shoud resolve a promise before timeout', (done) => {
        const testVal = 'Yay!'
        const p = new Promise((resolve) => {
            setTimeout(() => {
                resolve(testVal)
            }, 400)
        })

        utils.promiseTimeout(500, p)
            .then(val => {
                expect(val).toEqual(testVal)
                done()
            })
    })

    it('shoud delay a promise', (done) => {
        const testVal = 'Yay!'
        const p = Promise.resolve(testVal)
        utils.promiseDelay(p, 500)
            .then((val) => {
                expect(val).toBe(testVal)
                done()
            })
    })

    it('shoud delay with a promise', (done) => {
        utils.delay(500)
            .then(done())
    })
})

