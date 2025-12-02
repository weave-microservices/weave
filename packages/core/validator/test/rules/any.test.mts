import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import ModelValidator from '../../lib/validator.mts';

describe('Any validator', () => {
  it('any value', () => {
    const schema = {
      id: { type: 'any' },
      name: { type: 'string' }
    };

    const parameters = { id: new Date(), name: 'kevin ries' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
  });
});
