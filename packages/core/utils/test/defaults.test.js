const utils = require('../lib');

describe('Get properties by dot seperated path', () => {
  it('should return a property (1)', () => {
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
    };

    expect(utils.defaultsDeep(source)).toEqual(source);
  });

  it('should return a property (2)', () => {
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
    };

    expect(utils.defaultsDeep({}, source)).toEqual(source);
  });

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
    };

    expect(utils.defaultsDeep(undefined, source)).toEqual(source);
  });

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
    };

    expect(utils.defaultsDeep(source, undefined)).toEqual(source);
  });

  it('should return a property', () => {
    const source = {
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
          ws: [1, 2, 3]
        }
      }
    };

    const target = {
      name: 'test2',
      load: false,
      settings: {
        a: 200,
        endpoints: {
          https: true,
          http: false,
          tcp: false,
          ws: [1, 2, 3]
        }
      }
    };

    const merged = utils.defaultsDeep(target, source);

    expect(merged).toEqual({
      name: 'test2',
      load: false,
      settings: {
        a: 200,
        b: 400,
        test: {
          a: '',
          b: 1
        },
        endpoints: {
          https: true,
          http: false,
          tcp: false,
          ws: [1, 2, 3]
        }
      }
    });
  });
});
