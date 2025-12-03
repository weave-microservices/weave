import { wrapHandler } from '../../lib/utils/wrap-handler.mts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('IP List function', () => {
  it('should flatten an array a single level deep (1)', () => {
    const handler = function (/* context */) {
      // body
    };
    const result = wrapHandler(handler);
    assert.deepStrictEqual(result, { handler: handler });
  });
});
