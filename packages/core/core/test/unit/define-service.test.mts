import { defineService } from '../../lib/index.mts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Define service composition method', () => {
  it('shout return a typed schema.', () => {
    const schema = defineService({
      name: 'Test',
      actions: {}
    });

    assert.notStrictEqual(schema.name, undefined);
    assert.notStrictEqual(schema.actions, undefined);
  });
});
