const randomString = require('../src/random-string')

describe('Random String', () => {
    it('default return a random string with 24 digits.', () => {
        const token = randomString()
        expect(token.length).toBe(24)
    })

    it('Return a random string with X digits.', () => {
        const token = randomString(24)
        expect(token.length).toBe(48)
    })
})
