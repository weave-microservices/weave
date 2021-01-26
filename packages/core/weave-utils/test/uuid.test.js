const { generateUUID } = require('../lib')

describe('UUID generator', () => {
  it('should create a valid uuid', () => {
    const uuid = generateUUID()
    const pattern = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/
    expect(pattern.test(uuid)).toBe(true)
  })
})
