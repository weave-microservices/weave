import * as utils from '../src';

describe('String test', () => {
  it('should fail', () => {
    const func = function () {
      // function
    };

    const result = utils.isString(func);
    expect(result).toBe(false);
  });

  it('should succeed', () => {
    const result = utils.isString('func');
    expect(result).toBe(true);
  });

  it('should flatten an array a single level deep (1)', () => {
    const result = utils.isString(3);
    expect(result).toBe(false);
  });
});
