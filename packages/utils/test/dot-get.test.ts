import { dotGet, Translator } from '../src'

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


    const rans = new Translator(source, (str) => {
      return str
    })

    const rnewe = rans
      .get('settings')
      .get('connections')
    
    expect(dotGet(source, 'name')).toBe('test');
    expect(dotGet(source, 'settings.a')).toBe(100);
    expect(dotGet(source, 'settings.endpoints')).toEqual({
      http: true,
      tcp: false,
      ws: [1, 2, 3]
    });
    expect(dotGet(source, 'settings.endpoints.http')).toBe(true);
    expect(dotGet(source, 'settings.connections')).toEqual(source.settings.connections);
  });
});

