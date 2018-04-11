const Weave = require('../../lib/weave')

describe('Weave', () => {
    let weave
    beforeEach(() => {
        weave = Weave({
            logLevel: 'fatal'
        })
    })

    it('should have a start method', () => {
        expect(weave.start).toBeDefined()
    })

    it('should have a repl method', () => {
        expect(weave.repl).toBeDefined()
    })

    it('should have a createService method', () => {
        expect(weave.createService).toBeDefined()
    })

    it('should have a call method', () => {
        expect(weave.createService).toBeDefined()
    })

    it('should have a stop method', () => {
        expect(weave.createService).toBeDefined()
    })
})
