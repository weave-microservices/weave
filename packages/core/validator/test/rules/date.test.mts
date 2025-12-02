import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import ModelValidator from '../../lib/validator.mts';

describe('Date validator', () => {
  it('should validate with shortcut definition', () => {
    const schema = {
      date: 'date'
    };

    const parameters = { date: new Date() };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
  });

  it('date validator (valid)', () => {
    const schema = {
      date: { type: 'date' }
    };

    const parameters = { date: new Date() };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
  });

  it('boolean validator (invalid)', () => {
    const schema = {
      date: { type: 'date' }
    };

    const parameters = { date: '2020-02-24T15:17:51.908Z' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.ok(Array.isArray(result));
    assert.equal(result[0].message, 'The parameter "date" is not a valid date.');
  });

  it('should convert the given value in a date - valid', () => {
    const schema = {
      date: { type: 'date', convert: true }
    };

    const parameters: { date: string | Date } = { date: '2020-02-24T15:17:51.908Z' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    validate(parameters);

    assert.ok(parameters.date instanceof Date);
  });
});
