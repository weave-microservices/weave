import createCodec from '../../../../lib/transport/adapters/tcp/discovery/codec.mts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('TCP Discovery codec', () => {
  it('shout return a typed schema.', () => {
    const decoder = createCodec();

    assert.notStrictEqual(decoder.decode, undefined);
    assert.notStrictEqual(decoder.encode, undefined);

    const testObject = {
      name: 'Hans',
      age: 12,
      props: {
        height: 112,
        weight: 444
      }
    };

    const decoded = decoder.encode(testObject);
    const encoded = decoder.decode(decoded);
    assert.deepStrictEqual(encoded, testObject);
  });
});
