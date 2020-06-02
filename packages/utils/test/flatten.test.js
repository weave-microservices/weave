const utils = require('../lib')

describe('Flatten function', () => {
  it('should flatten an array a single level deep (1)', () => {
    const array = [1, 2, 3, [4, 5]]
    const result = utils.flatten(array)
    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('should flatten an array a single level deep (2)', () => {
    const array = [1, 2, 3, [4, [5]]]
    const result = utils.flatten(array)
    expect(result).toEqual([1, 2, 3, 4, [5]])
  })
})
