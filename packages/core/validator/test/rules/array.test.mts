import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import ModelValidator from '../../lib/validator.mts';

describe('Array type', () => {
  it('valid', () => {
    const schema = {
      id: { type: 'number', convert: true },
      name: { type: 'string' },
      coords: { type: 'array' }
    };

    const validator = ModelValidator();

    const validate = validator.compile(schema);
    const model = { id: '1234', name: 'kevin ries', coords: ['test1', 'test2'] };
    const result = validate(model);

    assert.equal(result, true);
  });

  it('invalid', () => {
    const schema = {
      id: { type: 'number', convert: true },
      coords: { type: 'array' }
    };

    const validator = ModelValidator();

    const validate = validator.compile(schema);
    const model = { id: '1234', name: 'kevin ries', coords: 'test' };
    const result = validate(model);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].message, 'The parameter "coords" have to be an array.');
  });

  it('invalid type', () => {
    const schema = {
      id: { type: 'number', convert: true },
      name: { type: 'string' },
      coords: { type: 'array', itemType: { type: 'string' }}
    };

    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const model = { id: '1234', name: 'kevin ries', coords: [1, 2] };
    const result = validate(model);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 2);
    assert.equal(result[0].message, 'The parameter "coords[0]" have to be a string.');
    assert.equal(result[1].message, 'The parameter "coords[1]" have to be a string.');
  });

  it('invalid min length', () => {
    const schema = {
      id: { type: 'number', convert: true },
      name: { type: 'string' },
      coords: { type: 'array', minLength: 5 }
    };

    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const model = { id: '1234', name: 'kevin ries', coords: [1, 2] };
    const result = validate(model);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].message, 'The parameter "coords" must contain at least 5 elements.');
  });

  it('invalid max length', () => {
    const schema = {
      id: { type: 'number', convert: true },
      name: { type: 'string' },
      coords: { type: 'array', maxLength: 2 }
    };

    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const model = { id: '1234', name: 'kevin ries', coords: [1, 2, 3] };
    const result = validate(model);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].message, 'The parameter "coords" may contain a maximum of 2 elements.');
  });

  it('invalid length', () => {
    const schema = {
      id: { type: 'number', convert: true },
      name: { type: 'string' },
      coords: { type: 'array', length: 2 }
    };

    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const model = { id: '1234', name: 'kevin ries', coords: [1, 2, 3] };
    const result = validate(model);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].message, 'The parameter "coords" must contain 2 elements.');
  });

  it('contains (valid)', () => {
    const schema = {
      coords: { type: 'array', contains: 3 }
    };

    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const model = { id: '1234', name: 'kevin ries', coords: [1, 2, 3] };
    const result = validate(model);

    assert.equal(result, true);
  });

  it('contains (invalid)', () => {
    const schema = {
      coords: { type: 'array', contains: 5 }
    };

    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const model = { id: '1234', name: 'kevin ries', coords: [1, 2, 3] };
    const result = validate(model);

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].message, 'The parameter "coords"  must contain the item "5".');
  });
});
