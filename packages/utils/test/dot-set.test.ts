import { dotSet } from '../src'

describe('Get properties by dot seperated path', () => {
  it('should modify a property', () => {
    const source = {
      name: 'test',
      settings: {
        a: 100,
        // endpoints: {
        //   http: true,
        //   tcp: false,
        //   ws: [1, 2, 3]
        // }
      }
    };
    dotSet(source, 'name', 'kevin');
    dotSet(source, 'settings.a', [1, 2, 3])
    expect(source.settings.a).toEqual([1, 2, 3]);
  });

  it('should create a new property', () => {
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

    const meta = { hostname: 'held' };
    dotSet(source, 'settings.meta', meta);
    // expect(source.settings.meta).toEqual(meta);
  });

  // it('should not override an existing property on the path that is not an object.', () => {
  //   const source = {
  //     name: 'test',
  //     settings: {
  //       a: 100,
  //       endpoints: {
  //         http: true,
  //         tcp: false,
  //         ws: [1, 2, 3]
  //       }
  //     }
  //   };

  //   const meta = { hostname: 'held' };

  //   try {
  //     dotSet(source, 'settings.a.b.c', meta);
  //     expect(source.settings.a.b.c).toThrow(meta);
  //   } catch (error) {
  //     expect(error.message).toBe('The property \"a\" already exists and is not an object.');
  //   }
  // });
});
