import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import ModelValidator from '../../lib/validator.mts';

describe('Number validator', () => {
  it('should validate number with short-hand definition', () => {
    const schema = {
      id: 'number'
    };

    const parameters = { id: 1234 };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
  });

  it('number validator (invalid)', () => {
    const schema = {
      id: { type: 'number' },
      name: { type: 'string' }
    };

    const parameters = { id: '1234', name: 'kevin ries' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].message, 'The parameter "id" have to be a number.');
  });

  it('number validator (valid)', () => {
    const schema = {
      id: { type: 'number' },
      name: { type: 'string' }
    };

    const parameters = { id: 1234, name: 'kevin ries' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
  });

  it('number min', () => {
    const schema = {
      id: { type: 'number', min: 1300 },
      name: { type: 'string' }
    };

    const parameters = { id: 1234, name: 'kevin ries' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].message, 'The value of parameter "id" must be at least 1300.');
  });

  it('number max', () => {
    const schema = {
      id: { type: 'number', max: 1000 },
      name: { type: 'string' }
    };

    const parameters = { id: 1234, name: 'kevin ries' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].message, 'The value of parameter "id" must not exceed 1000.');
  });

  it('should validate equal', () => {
    const schema = {
      id: { type: 'number', notEqual: 1234 }
    };

    const parameters = { id: 1234 };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].message, 'The value of the parameter "id" must not be equal to 1234.');
  });

  it('number equal', () => {
    const schema = {
      id: { type: 'number', equal: 1000 },
      name: { type: 'string' }
    };

    const parameters = { id: 1001, name: 'kevin ries' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].message, 'The value of the parameter "id" have to be equal 1000.');
  });

  it('number positive (succeed)', () => {
    const schema = {
      id: { type: 'number', positive: true }
    };

    const parameters = { id: 1001 };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
  });

  it('number positive (fail)', () => {
    const schema = {
      id: { type: 'number', positive: true }
    };

    const parameters = { id: -1001 };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].message, 'The value of the parameter "id" have to be positive.');
  });

  it('number negative (succeed)', () => {
    const schema = {
      id: { type: 'number', negative: true }
    };

    const parameters = { id: -1001 };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
  });

  it('number negative (fail)', () => {
    const schema = {
      id: { type: 'number', negative: true }
    };

    const parameters = { id: 1001 };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].message, 'The value of the parameter "id" have to be negative.');
  });

  it('number should be integer', () => {
    const schema = {
      id: { type: 'number', integer: true }
    };

    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result1 = validate({ id: 100 });

    assert.equal(result1, true);

    const result2 = validate({ id: 100.50 });
    assert.ok(Array.isArray(result2));
    assert.deepEqual(result2[0], {
      field: 'id',
      message: 'The value of the parameter "id" have to be an integer.',
      passed: 100.5,
      type: 'numberInteger'
    });
  });
});
