const promisify = require('../src/promisify')

describe('Promisify', () => {
    it('Should throw an error if passed in no function.')
    it('Should return a Promise for a function.', () => {
        const testFunc = () => {}
        const promise = promisify(testFunc)()
        expect(promise instanceof Promise).toBe(true)
    })
})
