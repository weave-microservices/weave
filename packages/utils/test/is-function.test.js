const utils = require('../lib')

describe('IP List function', () => {
  it('should flatten an array a single level deep (1)', () => {
    const func = function () {
      // function 
    }

    const result = utils.isFunction(func)
    expect(result).toBe(true)
  })

  it('should flatten an array a single level deep (1)', () => {
    const func = () => {
      // closure
    }

    const result = utils.isFunction(func)
    expect(result).toBe(true)
  })

  it('should flatten an array a single level deep (1)', () => {
    const func = {}
    const result = utils.isFunction(func)

    expect(result).toBe(false)
  })
})
