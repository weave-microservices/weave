const utils = require('../lib')

describe('Byte to size converter (short)', () => {
  it('should output the size. (Zero bytes)', () => {
    const bytes = 0
    const size = utils.bytesToSize(bytes)
    expect(size).toBe('0 Bytes')
  })

  it('should output the size. (Bytes)', () => {
    const bytes = 1023
    const size = utils.bytesToSize(bytes)
    expect(size).toBe('1023 Bytes')
  })

  it('should output the size for (Kilobytes)', () => {
    const bytes = 1024
    const size = utils.bytesToSize(bytes)
    expect(size).toBe('1 KB')
  })

  it('should output the size for (Kilobytes)', () => {
    const bytes = 20000
    const size = utils.bytesToSize(bytes)
    expect(size).toBe('20 KB')
  })

  it('should output the size for (Megabytes)', () => {
    const bytes = 1048576
    const size = utils.bytesToSize(bytes)
    expect(size).toBe('1 MB')
  })

  it('should output the size for (Gigabytes)', () => {
    const bytes = 1073741824
    const size = utils.bytesToSize(bytes)
    expect(size).toBe('1 GB')
  })

  it('should output the size for (TB)', () => {
    const bytes = 1.099511628E+12
    const size = utils.bytesToSize(bytes)
    expect(size).toBe('1 TB')
  })

  it('should output the size for (TB)', () => {
    const bytes = 1.125899907E+15
    const size = utils.bytesToSize(bytes)
    expect(size).toBe('1 PB')
  })

  it('should output the size for (TB)', () => {
    const bytes = 1.099511628E+12
    const size = utils.bytesToSize(bytes)
    expect(size).toBe('1 TB')
  })
})
