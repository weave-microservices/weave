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

  it('should clone an object with complex objects', () => {
    class TestObject {
      constructor (name) {
        this.name = name
      }

      fire () {
        return this.name
      }
    }
    const source = {
      name: 'test',
      ref: new TestObject('Hugo')
    }

    const newObject = utils.clone(source)
    expect(source).toEqual(newObject)
    expect(newObject.ref.fire()).toBe('Hugo')
  })
})
