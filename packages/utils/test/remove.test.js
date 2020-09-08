const { remove } = require('../lib')

describe('Remove', () => {
  it('should return a property', () => {
    const nums = [-1, 3, -3, -4, 5, 0, 7]

    const removedItems = remove(nums, function (n) {
      return n <= 0
    })

    expect(removedItems).toStrictEqual([0, -4, -3, -1])
    expect(nums).toStrictEqual([3, 5, 7])
  })
})
