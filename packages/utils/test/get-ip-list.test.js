const utils = require('../lib')

describe('IP List function', () => {
  it('should flatten an array a single level deep (1)', () => {
    const regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
    const result = utils.getIpList()
    expect(regex.test(result[0])).toBe(true)
  })
})
