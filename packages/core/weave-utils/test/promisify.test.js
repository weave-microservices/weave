const utils = require('../lib')

describe('Promisify', () => {
  it('should return a promise', done => {
    const func = jest.fn(x => x * 2)
    const pFunc = utils.promisify(func)
    expect(typeof pFunc(2).then).toBe('function')
    pFunc(2).then(result => {
      expect(result).toBe(4)
      done()
    })
  })

  it('should return a promise rejection', () => {
    const e = new Error('Failed!!!')
    const func = jest.fn(() => {
      throw e
    })
    const pFunc = utils.promisify(func)
    // expect(typeof pFunc(2).then).toBe('function')
    expect(pFunc(2)).rejects.toThrow('')
  })
})
