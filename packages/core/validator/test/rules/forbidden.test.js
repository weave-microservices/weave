const ModelValidator = require('../../src/validator');

describe('forbidden value test', () => {
  it('should throw an error if a forbidden value is passed', () => {
    const schema = {
      id: { type: 'forbidden' },
      name: { type: 'string' }
    };

    const parameters = { id: '1234', name: 'kevin ries' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].message).toBe('The parameter \"id\" is forbidden.');
  });

  it('should remove a forbidden value', () => {
    const schema = {
      id: { type: 'forbidden', remove: true },
      name: { type: 'string' }
    };

    const parameters = { id: '1234', name: 'kevin ries' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    expect(result).toBe(true);
    expect(parameters.id).toBe(undefined);
  });
});
