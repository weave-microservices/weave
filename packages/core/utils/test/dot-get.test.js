const utils = require('../lib');

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

    expect(utils.dotGet(source, 'name')).toBe('test');
    expect(utils.dotGet(source, 'settings.a')).toBe(100);
    expect(utils.dotGet(source, 'settings.endpoints')).toEqual({
      http: true,
      tcp: false,
      ws: [1, 2, 3]
    });
    expect(utils.dotGet(source, 'settings.endpoints.http')).toBe(true);
    expect(utils.dotGet(source, 'settings.connections')).toEqual(source.settings.connections);
  });
});
