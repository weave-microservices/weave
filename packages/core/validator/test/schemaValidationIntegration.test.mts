import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import ModelValidator from '../lib/validator.mts';

describe('Schema Validation Integration', () => {
  let validator: any;

  beforeEach(() => {
    validator = ModelValidator();
  });

  describe('schema validation enabled', () => {
    it('should validate schema when validateSchema option is true', () => {
      const validSchema = {
        name: { type: 'string', minLength: 1 },
        age: { type: 'number', min: 0 }
      };

      assert.doesNotThrow(() => {
        validator.compile(validSchema, { validateSchema: true });
      });
    });

    it('should throw error for invalid schema when validation is enabled', () => {
      const invalidSchema = {
        name: { type: 'invalid' },
        age: { type: 'number' }
      };

      assert.throws(() => {
        validator.compile(invalidSchema, { validateSchema: true });
      }, /Invalid schema/);
    });

    it('should throw error for invalid options when validation is enabled', () => {
      const validSchema = {
        name: { type: 'string' }
      };

      assert.throws(() => {
        validator.compile(validSchema, {
          validateSchema: true,
          strictMode: 'invalid' as any
        });
      }, /Invalid validation options/);
    });

    it('should validate complex nested schemas', () => {
      const complexSchema = {
        user: {
          type: 'object',
          properties: {
            profile: {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 1 },
                contacts: {
                  type: 'array',
                  itemType: {
                    type: 'multi',
                    rules: [
                      { type: 'email' },
                      { type: 'string', phone: true }
                    ]
                  }
                }
              }
            },
            preferences: {
              type: 'object',
              properties: {
                theme: {
                  type: 'enum',
                  values: ['light', 'dark']
                },
                notifications: { type: 'boolean' }
              }
            }
          }
        }
      };

      assert.doesNotThrow(() => {
        validator.compile(complexSchema, { validateSchema: true });
      });
    });

    it('should provide detailed error messages for nested schema errors', () => {
      const invalidNestedSchema = {
        user: {
          type: 'object',
          properties: {
            profile: {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: -1 }, // invalid
                age: { type: 'invalid' } // invalid type
              }
            }
          }
        }
      };

      assert.throws(() => {
        validator.compile(invalidNestedSchema, { validateSchema: true });
      }, (err: Error) => {
        assert.ok(err.message.includes('Invalid schema'));
        assert.ok(err.message.includes('minLength'));
        return true;
      });
    });

    it('should validate root schemas', () => {
      const rootSchema = { type: 'string', minLength: 1 };

      assert.doesNotThrow(() => {
        validator.compile(rootSchema, { validateSchema: true, root: true });
      });
    });

    it('should validate array root schemas', () => {
      const arraySchema = [
        { type: 'string' },
        { type: 'number' }
      ];

      assert.doesNotThrow(() => {
        validator.compile(arraySchema, { validateSchema: true, root: true });
      });
    });
  });

  describe('schema validation disabled', () => {
    it('should not validate schema when validateSchema option is false', () => {
      const invalidSchema = {
        name: { type: 'invalid' }
      };

      // Should not throw because validation is disabled by default
      assert.doesNotThrow(() => {
        validator.compile(invalidSchema);
      });
    });

    it('should compile successfully with invalid schema when validation disabled', () => {
      const schema = {
        name: { type: 'string' }
      };

      const validate = validator.compile(schema);
      assert.ok(typeof validate === 'function');
    });
  });
});
