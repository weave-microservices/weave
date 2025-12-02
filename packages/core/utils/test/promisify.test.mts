import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { promisify } from '../lib/promisify.mts';

describe('Promisify', () => {
  it('should return a promise', async () => {
    const func = (x: number) => x * 2;
    const pFunc = promisify(func);
    assert.strictEqual(typeof pFunc(2).then, 'function');
    const result = await pFunc(2);
    assert.strictEqual(result, 4);
  });

  it('should return a promise rejection', async () => {
    const e = new Error('Failed!!!');
    const func = () => {
      throw e;
    };
    const pFunc = promisify(func);
    await assert.rejects(pFunc(), {
      message: 'Failed!!!'
    });
  });
});
