const utils = require('../lib');

describe('IP List function', () => {
  it('should flatten an array a single level deep (1)', () => {
    const source = {
      a: 5,
      b: 'Hello',
      c: [0, 1, 2],
      d: {
        e: false,
        f: 1.23
      },
      h: (ctx) => ctx
    };

    const result = utils.safeCopy(source);
    expect(result).not.toBe(source);
    expect(result).toEqual({
      a: 5,
      b: 'Hello',
      c: [0, 1, 2],
      d: {
        e: false,
        f: 1.23
      }
    });
  });
});
