import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { wrapInArray } from '../lib/wrap-in-array.mts';

describe('Wrap in array function', () => {
  it('should wrap string in array', () => {
    const itemToWrap = 'string';
    const result = wrapInArray(itemToWrap);
    assert.deepStrictEqual(result, [itemToWrap]);
  });

  it('should wrap object in array', () => {
    const itemToWrap = { handler: () => {} };
    const result = wrapInArray(itemToWrap);
    assert.deepStrictEqual(result, [itemToWrap]);
  });
});
