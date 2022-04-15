const ModelValidator = require('../../src/validator');

describe('Date validator', () => {
  it('should validate with shortcut definition', () => {
    const schema = {
      date: 'date'
    };

    const parameters = { date: new Date() };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    expect(result).toBe(true);
  });

  it('date validator (valid)', () => {
    const schema = {
      date: { type: 'date' }
    };

    const parameters = { date: new Date() };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    expect(result).toBe(true);
  });

  it('boolean validator (invalid)', () => {
    const schema = {
      date: { type: 'date' }
    };

    const parameters = { date: '2020-02-24T15:17:51.908Z' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    expect(Array.isArray(result)).toBe(true);
    expect(result[0].message).toBe('The parameter "date" is not a valid date.');
  });

  it('should convert the given value in a date - valid', () => {
    const schema = {
      date: { type: 'date', convert: true }
    };

    const parameters = { date: '2020-02-24T15:17:51.908Z' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    validate(parameters);

    expect(parameters.date instanceof Date).toBe(true);
  });
});
