import * as utils from '../src';

describe('Plain object check (strict mode)', () => {
  it('should detect plain object (false with string)', () => {
    const result = utils.isPlainObject('');
    expect(result).toBe(false);
  });

  it('should detect plain object (false with number)', () => {
    const result = utils.isPlainObject(1);
    expect(result).toBe(false);
  });

  it('should detect plain object (false with null)', () => {
    const result = utils.isPlainObject(null);
    expect(result).toBe(false);
  });

  it('should detect plain object (true)', () => {
    const result = utils.isPlainObject({
      name: 'Kevin'
    });

    expect(result).toBe(true);
  });
});

describe('Plain object check (non strict mode)', () => {
  it('should detect plain object (false with string)', () => {
    const result = utils.isPlainObject('dasdas', false);
    expect(result).toBe(true);
  });
});
