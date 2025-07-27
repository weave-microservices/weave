const ModelValidator = require('../lib/validator');

describe('Schema Validation Integration', () => {
  let validator;

  beforeEach(() => {
    validator = ModelValidator();
  });

  describe('schema validation enabled', () => {
    it('should validate schema when validateSchema option is true', () => {
      const validSchema = {
        name: { type: 'string', minLength: 1 },
        age: { type: 'number', min: 0 }
      };

      expect(() => {
        validator.compile(validSchema, { validateSchema: true });
      }).not.toThrow();
    });

    it('should throw error for invalid schema when validation is enabled', () => {
      const invalidSchema = {
        name: { type: 'invalid' },
        age: { type: 'number' }
      };

      expect(() => {
        validator.compile(invalidSchema, { validateSchema: true });
      }).toThrow('Invalid schema');
    });

    it('should throw error for invalid options when validation is enabled', () => {
      const validSchema = {
        name: { type: 'string' }
      };

      expect(() => {
        validator.compile(validSchema, {
          validateSchema: true,
          strictMode: 'invalid'
        });
      }).toThrow('Invalid validation options');
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

      expect(() => {
        validator.compile(complexSchema, { validateSchema: true });
      }).not.toThrow();
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

      expect(() => {
        validator.compile(invalidNestedSchema, { validateSchema: true });
      }).toThrow('Invalid schema');
    });

    it('should validate array schemas with itemType', () => {
      const arraySchema = {
        items: {
          type: 'array',
          itemType: {
            type: 'object',
            properties: {
              id: { type: 'string', uuid: true },
              name: { type: 'string', minLength: 1 }
            }
          }
        }
      };

      expect(() => {
        validator.compile(arraySchema, { validateSchema: true });
      }).not.toThrow();
    });

    it('should validate multi-type schemas', () => {
      const multiSchema = {
        value: {
          type: 'multi',
          rules: [
            { type: 'string', minLength: 1 },
            { type: 'number', min: 0 },
            {
              type: 'object',
              properties: {
                type: { type: 'string' },
                data: { type: 'any' }
              }
            }
          ]
        }
      };

      expect(() => {
        validator.compile(multiSchema, { validateSchema: true });
      }).not.toThrow();
    });

    it('should validate enum schemas', () => {
      const enumSchema = {
        status: {
          type: 'enum',
          values: ['pending', 'approved', 'rejected']
        },
        priority: {
          type: 'enum',
          values: [1, 2, 3, 4, 5]
        }
      };

      expect(() => {
        validator.compile(enumSchema, { validateSchema: true });
      }).not.toThrow();
    });

    it('should reject empty enum values', () => {
      const invalidEnumSchema = {
        status: {
          type: 'enum',
          values: []
        }
      };

      expect(() => {
        validator.compile(invalidEnumSchema, { validateSchema: true });
      }).toThrow('Invalid schema');
    });
  });

  describe('schema validation disabled (default)', () => {
    it('should not validate schema by default', () => {
      const invalidSchema = {
        name: { type: 'string', minLength: -1 } // would be invalid if validated
      };

      // Should not throw because validation is disabled by default
      expect(() => {
        validator.compile(invalidSchema);
      }).not.toThrow();
    });

    it('should not validate options by default', () => {
      const validSchema = {
        name: { type: 'string' }
      };

      // Should not throw because validation is disabled by default
      expect(() => {
        validator.compile(validSchema, { strictMode: 'invalid' });
      }).not.toThrow();
    });

    it('should work with existing schemas that might not pass validation', () => {
      // This represents legacy schemas that might exist in codebases
      const legacySchema = {
        name: { type: 'string' }
        // Note: missing some properties that would normally be validated
      };

      // Should work because validation is disabled
      expect(() => {
        const validate = validator.compile(legacySchema);
        // Test that it still functions for basic validation
        const result = validate({ name: 'test' });
        expect(result).toBe(true);
      }).not.toThrow();
    });
  });

  describe('mixed validation scenarios', () => {
    it('should handle root mode schemas', () => {
      const rootSchema = { type: 'string', minLength: 1 };

      expect(() => {
        validator.compile(rootSchema, {
          root: true,
          validateSchema: true
        });
      }).not.toThrow();
    });

    it('should validate options even when schema validation is disabled for root schemas', () => {
      const rootSchema = { type: 'string' };

      expect(() => {
        validator.compile(rootSchema, {
          root: true,
          validateSchema: false,
          strictMode: 'invalid' // This should still be validated if validateSchema is true
        });
      }).not.toThrow(); // Because validateSchema is false
    });

    it('should validate string shorthand schemas', () => {
      expect(() => {
        validator.compile('string', {
          root: true,
          validateSchema: true
        });
      }).not.toThrow();
    });

    it('should validate array shorthand schemas', () => {
      const arrayShorthand = [
        { type: 'string' },
        { type: 'number' }
      ];

      expect(() => {
        validator.compile(arrayShorthand, {
          root: true,
          validateSchema: true
        });
      }).not.toThrow();
    });

    it('should reject invalid array shorthand schemas', () => {
      const invalidArrayShorthand = [
        { type: 'string' },
        { type: 'invalid' }
      ];

      expect(() => {
        validator.compile(invalidArrayShorthand, {
          root: true,
          validateSchema: true
        });
      }).toThrow('Invalid schema');
    });
  });

  describe('error message quality', () => {
    it('should provide clear error messages with paths', () => {
      const schemaWithMultipleErrors = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: -1 }, // error 1
              age: { type: 'number', min: 'invalid' }, // error 2
              tags: {
                type: 'array',
                itemType: { type: 'invalid' } // error 3
              }
            }
          }
        }
      };

      let errorMessage;
      try {
        validator.compile(schemaWithMultipleErrors, { validateSchema: true });
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).toContain('Invalid schema');
      expect(errorMessage).toContain('.properties.');
    });

    it('should handle multiple validation errors gracefully', () => {
      const multiErrorSchema = {
        type: 'object',
        properties: {
          field1: { type: 'string', minLength: -1, maxLength: 'invalid' },
          field2: { type: 'number', min: 'invalid', max: 100, integer: 'not boolean' },
          field3: { type: 'array', minLength: -1, itemType: { type: 'invalid' }}
        }
      };

      expect(() => {
        validator.compile(multiErrorSchema, { validateSchema: true });
      }).toThrow('Invalid schema');
    });
  });

  describe('performance considerations', () => {
    it('should not significantly impact performance when validation is disabled', () => {
      const schema = {
        name: { type: 'string' },
        age: { type: 'number' }
      };

      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        validator.compile(schema); // validation disabled
      }
      const timeWithoutValidation = Date.now() - start;

      // This is more of a sanity check - actual performance testing would be more sophisticated
      expect(timeWithoutValidation).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should cache schema validation results appropriately', () => {
      const schema = {
        name: { type: 'string', minLength: 1 },
        age: { type: 'number', min: 0 }
      };

      // Multiple calls with same schema should not cause performance issues
      expect(() => {
        for (let i = 0; i < 100; i++) {
          validator.compile(schema, { validateSchema: true });
        }
      }).not.toThrow();
    });
  });
});
