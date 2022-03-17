const utils = require('../lib');

describe('Pick test', () => {
  it('should pick properties from object', () => {
    const source = {
      name: 'test',
      settings: {
        a: 100,
        endpoints: {
          http: true,
          tcp: false,
          ws: [1, 2, 3]
        },
        connections: [{
          host: 'test.de',
          ip: '127.0.0.1'
        },
        {
          host: 'google.com',
          ip: '127.0.0.1'
        }]
      }
    };

    const result = utils.pick(source, ['settings']);
    expect(result.settings).toBeDefined();
    expect(result.settings).toEqual(utils.dotGet(source, 'settings'));

    const result2 = utils.pick(source, ['settings.endpoints']);
    expect(result2.settings).toBeDefined();
    expect(result2.settings.endpoints).toBeDefined();
    expect(result2.settings.endpoints).toEqual(utils.dotGet(source, 'settings.endpoints'));
  });
});
