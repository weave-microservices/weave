import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import ModelValidator from '../../lib/validator.mts';

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

    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].message, 'The parameter "id" is forbidden.');
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

    assert.equal(result, true);
    assert.equal(parameters.id, undefined);
  });
});
