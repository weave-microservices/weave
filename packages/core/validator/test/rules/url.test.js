const ModelValidator = require('../../lib/validator');

describe('URL validator', () => {
  it('should pass with https', () => {
    const schema = {
      url: { type: 'url' }
    };

    const parameters = { url: 'https://web.de' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    expect(result).toBe(true);
  });

  it('should pass with http', () => {
    const schema = {
      url: { type: 'url' }
    };

    const parameters = { url: 'http://web.de' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    expect(result).toBe(true);
  });

  it('should fail with other protocols', () => {
    const schema = {
      url: { type: 'url' }
    };

    const parameters = { url: 'ftp://web.de' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    expect(Array.isArray(result)).toBe(true);
  });
});
