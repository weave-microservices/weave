import { createFakeRuntime } from '../helper/runtime.mts';
import { initUUIDFactory } from '../../lib/runtime/initUuidFactory.mts';
import { describe, it, test } from 'node:test';
import assert from 'node:assert/strict';

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

describe('Test UUID factory', () => {
  it('should decorate runtime', () => {
    const runtime = createFakeRuntime();
    initUUIDFactory(runtime);
    assert.notStrictEqual(runtime.generateUUID, undefined);
  });

  it('should generate a valid uuid by default', () => {
    const runtime = createFakeRuntime();
    initUUIDFactory(runtime);
    const uuid = runtime.generateUUID();
    UUID_REGEX.test(uuid);
  });
});
