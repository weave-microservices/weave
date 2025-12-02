import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isPlainObject } from '../lib/is-plain-object.mts';

describe('Plain object check (strict mode)', () => {
  it('should detect plain object (false with string)', () => {
    const result = isPlainObject('');
    assert.strictEqual(result, false);
  });

  it('should detect plain object (false with number)', () => {
    const result = isPlainObject(1);
    assert.strictEqual(result, false);
  });

  it('should detect plain object (false with null)', () => {
    const result = isPlainObject(null);
    assert.strictEqual(result, false);
  });

  it('should detect plain object (true)', () => {
    const result = isPlainObject({
      name: 'Kevin'
    });

    assert.strictEqual(result, true);
  });
});

describe('Plain object check (non strict mode)', () => {
  it('should detect plain object (false with string)', () => {
    const result = isPlainObject('dasdas', false);
    assert.strictEqual(result, true);
  });
});
