import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isString } from '../lib/is-string.mts';

describe('String test', () => {
  it('should fail for function', () => {
    const func = function () {
      // function
    };

    const result = isString(func);
    assert.strictEqual(result, false);
  });

  it('should succeed for string', () => {
    const result = isString('func');
    assert.strictEqual(result, true);
  });

  it('should fail for number', () => {
    const result = isString(3);
    assert.strictEqual(result, false);
  });
});
