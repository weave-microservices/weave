const utils = require('../lib')

describe('Event bus', () => {
  it('should create an event bus', () => {
    const result = utils.createEventEmitter()
    expect(result.on).toBeDefined()
    expect(result.emit).toBeDefined()
  })
})
