const { defineService } = require('../../src/index');

describe('Define service composition method', () => {
  it('shout return a typed schema.', () => {
    const schema = defineService({
      name: 'Test',
      actions: {}
    });

    expect(schema.name).toBeDefined();
    expect(schema.actions).toBeDefined();
  });
});
