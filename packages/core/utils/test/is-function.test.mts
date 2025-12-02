import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isFunction } from '../lib/is-function.mts';

describe('isFunction tests', () => {
  it('should return true for regular function', () => {
    const func = function () {
      // function
    };

    const result = isFunction(func);
    assert.strictEqual(result, true);
  });

  it('should return true for arrow function', () => {
    const func = () => {
      // closure
    };

    const result = isFunction(func);
    assert.strictEqual(result, true);
  });

  it('should return false for object', () => {
    const func = {};
    const result = isFunction(func);

    assert.strictEqual(result, false);
  });

  it('should work with async functions', () => {
    const func = async () => {};
    const func2 = async function () {};

    assert.strictEqual(isFunction(func), true);
    assert.strictEqual(isFunction(func2), true);
  });
});
