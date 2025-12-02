import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { flatten } from '../lib/flatten.mts';
import { flattenDeep } from '../lib/flatten-deep.mts';

describe('Flatten function', () => {
  it('should flatten an array a single level deep (1)', () => {
    const array = [1, 2, 3, [4, 5]];
    const result = flatten(array);
    assert.deepStrictEqual(result, [1, 2, 3, 4, 5]);
  });

  it('should flatten an array a single level deep (2)', () => {
    const array = [1, 2, 3, [4, [5]]];
    const result = flatten(array);
    assert.deepStrictEqual(result, [1, 2, 3, 4, [5]]);
  });
});

describe('Flatten deep function', () => {
  it('should flatten an array recursively', () => {
    const array = [1, 2, 3, [4, 5, [6, 7]]];
    const result = flattenDeep(array);
    assert.deepStrictEqual(result, [1, 2, 3, 4, 5, 6, 7]);
  });
});
