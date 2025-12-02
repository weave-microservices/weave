import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Readable, Writable } from 'node:stream';
import { isStreamObjectMode } from '../lib/is-stream-object-mode.mts';

describe('Is stream object mode function', () => {
  it('should detect a writable stream object (true)', () => {
    const stream = new Writable({ objectMode: true });
    const result = isStreamObjectMode(stream);

    assert.strictEqual(result, true);
  });

  it('should detect a readable stream object (true)', () => {
    const stream = new Readable({ objectMode: true });
    const result = isStreamObjectMode(stream);

    assert.strictEqual(result, true);
  });

  it('should detect a stream object (false)', () => {
    const stream = new Readable({ objectMode: false });
    const result = isStreamObjectMode(stream);

    assert.strictEqual(result, false);
  });

  it('should detect a non-stream object (false)', () => {
    const stream = {};
    const result = isStreamObjectMode(stream);

    assert.strictEqual(result, false);
  });
});
