import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { match } from '../lib/match.mts';

describe('pattern match function', () => {
  it('should match patterns', () => {
    assert.strictEqual(match('1.2.3', '1.2.3'), true);
    assert.strictEqual(match('1.2.3.4', '1.2.3.4'), true);

    assert.strictEqual(match('1.2.3', '1.2.*'), true);
    assert.strictEqual(match('1.3.3', '1.2.*'), false);

    assert.strictEqual(match('1.2.3', '1.?.3'), true);
    assert.strictEqual(match('1.2.3', '$1.?.3'), false);

    assert.strictEqual(match('1', '*'), true);
    assert.strictEqual(match('11', '**'), true);

    assert.strictEqual(match('12.45.67', '12.45.**'), true);
  });
});
