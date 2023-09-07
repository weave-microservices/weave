import * as utils from '../src';

describe('IP List function', () => {
  it('should flatten an array a single level deep (1)', () => {
    const func = function () {
      // function
    };

    const result = utils.isFunction(func);
    expect(result).toBe(true);
  });

  it('should flatten an array a single level deep (1)', () => {
    const func = () => {
      // closure
    };

    const result = utils.isFunction(func);
    expect(result).toBe(true);
  });

  it('should flatten an array a single level deep (1)', () => {
    const func = {};
    const result = utils.isFunction(func);

    expect(result).toBe(false);
  });

  it('should work with async functions', () => {
    const func = async () => {};
    const func2 = async function () {};

    expect(utils.isFunction(func)).toBe(true);
    expect(utils.isFunction(func2)).toBe(true);
  });
});
