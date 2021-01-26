const utils = require('../lib')

describe('Get properties by dot seperated path', () => {
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

    expect(utils.defaultsDeep(source)).toEqual(source)
  })

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

    expect(utils.defaultsDeep({}, source)).toEqual(source)
  })

  it('should get defaults with an undefined target', () => {
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

    expect(utils.defaultsDeep(undefined, source)).toEqual(source)
  })

  it('should not merge undefined props', () => {
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

    expect(utils.defaultsDeep(source, undefined)).toEqual(source)
  })

  it('should return a property', () => {
    const defaults = {
      name: 'test',
      load: true,
      adapter: undefined,
      settings: {
        a: 100,
        b: 400,
        test: {
          a: '',
          b: 1,
          c: undefined
        },
        endpoints: {
          http: true,
          tcp: false,
          debug: true,
          ws: [1, 2, 3],
          heartbeat: false
        }
      }
    }

    const target = {
      name: 'test2',
      load: false,
      settings: {
        a: 200,
        endpoints: {
          https: true,
          http: false,
          tcp: false,
          ws: [1, 2, 3],
          heartbeat: true
        }
      }
    }

    const merged = utils.defaultsDeep(target, defaults)

    expect(merged).toEqual({
      name: 'test2',
      load: false,
      adapter: undefined,
      settings: {
        a: 200,
        b: 400,
        test: {
          a: '',
          b: 1,
          c: undefined
        },
        endpoints: {
          https: true,
          http: false,
          tcp: false,
          debug: true,
          ws: [1, 2, 3],
          heartbeat: true
        }
      }
    })
  })
})
