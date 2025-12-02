import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { uuid } from '../lib/uuid.mts';

describe('UUID generator', () => {
  it('should create a valid uuid', () => {
    const generatedUuid = uuid();
    const pattern = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;
    assert.strictEqual(pattern.test(generatedUuid), true);
  });
});
