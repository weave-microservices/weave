const utils = require('../lib')

describe('Omit', () => {
  it('should return a property', () => {
    const source = {
      name: 'test',
      settings: {
        a: 100,
        endpoints: {
          http: true,
          tcp: false,
          ws: [1, 2, 3]
        }
      }
    }

    expect(utils.omit(null, ['settings'])).toBe(null)
    expect(utils.omit(source, ['settings'])).toEqual({
      name: 'test'
    })
  })
})
