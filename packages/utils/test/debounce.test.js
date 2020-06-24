const utils = require('../lib')
const lolex = require('lolex')

describe('Debounce', () => {
  let clock
  beforeEach(() => {
    clock = lolex.install()
  })

  afterEach(() => {
    clock.uninstall()
  })

  it('debounce an action call', () => {
    const func = jest.fn()
    const debounceFunc = utils.debounce(func, 200)

    // Call immediately
    debounceFunc()
    expect(func).toHaveBeenCalledTimes(0)

    // Call it several times with 100ms between each.
    for (let i = 0; i < 10; i++) {
      clock.tick(100)
      debounceFunc()
    }

    // wait 300ms
    clock.tick(300)
    expect(func).toHaveBeenCalledTimes(1)
  })

  it('debounce an action call, but call it immediately', () => {
    const func = jest.fn()
    const debounceFunc = utils.debounce(func, 200, true)

    // Call immediately
    debounceFunc()
    expect(func).toHaveBeenCalledTimes(1)

    // Call it several times with 100ms between each.
    for (let i = 0; i < 10; i++) {
      clock.tick(100)
      debounceFunc()
    }

    // wait 300ms. Counter should stay 1
    clock.tick(300)
    expect(func).toHaveBeenCalledTimes(1)
  })
})
