import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { bytesToSize } from '../lib/bytes-to-size.mts';

describe('Byte to size converter', () => {
  it('should output the size (Zero bytes)', () => {
    const bytes = 0;
    const size = bytesToSize(bytes);
    assert.strictEqual(size, '0 Bytes');
  });

  it('should output the size (Bytes)', () => {
    const bytes = 1023;
    const size = bytesToSize(bytes);
    assert.strictEqual(size, '1023 Bytes');
  });

  it('should output the size for (Kilobytes)', () => {
    const bytes = 1024;
    const size = bytesToSize(bytes);
    assert.strictEqual(size, '1 KB');
  });

  it('should output the size for (Kilobytes) 20KB', () => {
    const bytes = 20000;
    const size = bytesToSize(bytes);
    assert.strictEqual(size, '20 KB');
  });

  it('should output the size for (Kilobytes) 23KB', () => {
    const bytes = 23456;
    const size = bytesToSize(bytes);
    assert.strictEqual(size, '23 KB');
  });

  it('should output the size for (Megabytes)', () => {
    const bytes = 1048576;
    const size = bytesToSize(bytes);
    assert.strictEqual(size, '1 MB');
  });

  it('should output the size for (Gigabytes)', () => {
    const bytes = 1073741824;
    const size = bytesToSize(bytes);
    assert.strictEqual(size, '1 GB');
  });

  it('should output the size for (TB)', () => {
    const bytes = 1.099511628E+12;
    const size = bytesToSize(bytes);
    assert.strictEqual(size, '1 TB');
  });

  it('should output the size for (PB)', () => {
    const bytes = 1.125899907E+15;
    const size = bytesToSize(bytes);
    assert.strictEqual(size, '1 PB');
  });
});
