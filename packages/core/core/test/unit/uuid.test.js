const { createFakeRuntime } = require('../helper/runtime');
const { initUUIDFactory } = require('../../lib/runtime/initUuidFactory');

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

describe('Test UUID factory', () => {
  it('should decorate runtime', () => {
    const runtime = createFakeRuntime();
    initUUIDFactory(runtime);
    expect(runtime.generateUUID).toBeDefined();
  });

  it('should generate a valid uuid by default', () => {
    const runtime = createFakeRuntime();
    initUUIDFactory(runtime);
    const uuid = runtime.generateUUID();
    UUID_REGEX.test(uuid);
  });
});
