const utils = require('../lib')

describe('Object clone method', () => {
  it('should clone an object', () => {
    const source = {
      name: 'test',
      actions: {
        help () {

        }
      },
      arrs: [1, 2, 3, 4, 5]
    }

    const newObject = utils.clone(source)
    expect(source).toEqual(newObject)
  })
})
