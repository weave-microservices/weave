const messages = require('../lib/messages');

describe('Test default messages', () => {
  it('should provide default messages', () => {
    expect(messages.required).toBeDefined();
    expect(messages.string).toBeDefined();
    expect(messages.stringMinLength).toBeDefined();
    expect(messages.stringMaxLength).toBeDefined();
    expect(messages.stringEqual).toBeDefined();
    expect(messages.stringContain).toBeDefined();
    expect(messages.stringBase64).toBeDefined();
    expect(messages.boolean).toBeDefined();
    expect(messages.array).toBeDefined();
    expect(messages.date).toBeDefined();
    expect(messages.email).toBeDefined();
    expect(messages.forbidden).toBeDefined();
    expect(messages.number).toBeDefined();
    expect(messages.numberMin).toBeDefined();
    expect(messages.numberMin).toBeDefined();
    expect(messages.numberMax).toBeDefined();
    expect(messages.numberInteger).toBeDefined();
    expect(messages.numberPositive).toBeDefined();
    expect(messages.numberNegative).toBeDefined();
    expect(messages.numberEqual).toBeDefined();
    expect(messages.numberNotEqual).toBeDefined();
    expect(messages.object).toBeDefined();
    expect(messages.url).toBeDefined();
    expect(messages.string).toBeDefined();
    expect(messages.arrayMinLength).toBeDefined();
    expect(messages.arrayMaxLength).toBeDefined();
    expect(messages.arrayContains).toBeDefined();
    expect(messages.enumValues).toBeDefined();
    expect(messages.objectStrict).toBeDefined();
  });
});
