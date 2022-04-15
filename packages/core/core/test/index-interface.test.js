const Module = require('../src/index');

describe('Module interface', () => {
  it('should have properties', () => {
    expect(Module.Cache).toBeDefined();
    expect(Module.Constants).toBeDefined();
    expect(Module.Errors).toBeDefined();
    expect(Module.TracingAdapters).toBeDefined();
    expect(Module.TransportAdapters).toBeDefined();
    expect(Module.Weave).toBeDefined();
    expect(Module.createBroker).toBeDefined();
    expect(Module.defaultOptions).toBeDefined();
    expect(Module.defineAction).toBeDefined();
    expect(Module.defineBrokerOptions).toBeDefined();
    expect(Module.defineService).toBeDefined();
    expect(Module.createBaseTracingCollector).toBeDefined();
  });
});
