const { initServiceManager } = require('../../../src/runtime/initServiceManager');
const { createFakeRuntime } = require('../../helper/runtime');

describe('Test service manager init.', () => {
  it('should attach service utilities to runtime.', () => {
    const runtime = createFakeRuntime();

    initServiceManager(runtime);

    expect(runtime.services).toBeDefined();
    expect(runtime.services.serviceList).toBeDefined();
    expect(runtime.services.destroyService).toBeDefined();
    expect(runtime.services.serviceChanged).toBeDefined();
    expect(runtime.services.waitForServices).toBeDefined();
  });
});
