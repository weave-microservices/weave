import { omit } from '../src';

describe('Omit', () => {
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
    };

    expect(omit(null, 'settings')).toBe(null);
    expect(omit(source, 'name')).toEqual({
      name: 'test'
    });
  });
});
