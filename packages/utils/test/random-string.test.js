const utils = require('../lib')

describe('Get properties by dot seperated path', () => {
  it('should return a property', () => {
    expect(utils.createRandomString()).not.toBe('')
    expect(utils.createRandomString().length).toBe(24)
    expect(utils.createRandomString(24).length).toBe(48)
  })
})
