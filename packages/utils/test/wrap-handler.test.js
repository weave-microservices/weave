const utils = require('../lib')

describe('IP List function', () => {
  it('should flatten an array a single level deep (1)', () => {
    const handler = function (/* context */) {
      // body
    }
    const result = utils.wrapHandler(handler)
    expect(result).toEqual({ handler: handler })
  })
})
