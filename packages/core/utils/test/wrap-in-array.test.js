const utils = require('../lib')

describe('IP List function', () => {
  it('should flatten an array a single level deep (1)', () => {
    const itemToWrap = 'string'
    const result = utils.wrapInArray(itemToWrap)
    expect(result).toEqual([itemToWrap])
  })

  it('should flatten an array a single level deep (1)', () => {
    const itemToWrap = { handler: () => {} }
    const result = utils.wrapInArray(itemToWrap)
    expect(result).toEqual([itemToWrap])
  })
})
