const { validateSchema, validateOptions } = require('../lib/schemaValidator');

describe('Schema Validator', () => {
  describe('validateSchema', () => {
    describe('basic schema types', () => {
      it('should validate string shorthand', () => {
        const errors = validateSchema('string');
        expect(errors).toEqual([]);
      });

      it('should reject invalid string shorthand', () => {
        const errors = validateSchema('invalid');
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('Invalid type "invalid"');
        expect(errors[0].path).toBe('');
      });

      it('should validate all valid type shorthands', () => {
        const validTypes = ['any', 'array', 'boolean', 'date', 'email', 'enum', 'forbidden', 'multi', 'number', 'object', 'string', 'url'];
        validTypes.forEach(type => {
          const errors = validateSchema(type);
          expect(errors).toEqual([]);
        });
      });
    });

    describe('array schemas', () => {
      it('should validate array shorthand', () => {
        const errors = validateSchema([{ type: 'string' }, { type: 'number' }]);
        expect(errors).toEqual([]);
      });

      it('should reject empty array', () => {
        const errors = validateSchema([]);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('Multi-type schema array cannot be empty');
        expect(errors[0].path).toBe('');
      });

      it('should validate nested array schemas', () => {
        const errors = validateSchema([
          { type: 'string', minLength: 1 },
          { type: 'number', min: 0 },
          [{ type: 'boolean' }, { type: 'date' }]
        ]);
        expect(errors).toEqual([]);
      });

      it('should report errors in array items with correct paths', () => {
        const errors = validateSchema([
          { type: 'invalid' },
          { type: 'string', minLength: -1 }
        ]);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.path === '[0].type')).toBe(true);
        expect(errors.some(e => e.path === '[1].minLength')).toBe(true);
      });
    });

    describe('invalid schemas', () => {
      it('should reject null schema', () => {
        const errors = validateSchema(null);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('Schema must be an object, string, or array');
      });

      it('should reject undefined schema', () => {
        const errors = validateSchema(undefined);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('Schema must be an object, string, or array');
      });

      it('should reject number schema', () => {
        const errors = validateSchema(123);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('Schema must be an object, string, or array');
      });

      it('should reject schema without type', () => {
        const errors = validateSchema({});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('Schema must have a "type" property');
        expect(errors[0].path).toBe('.type');
      });

      it('should reject schema with invalid type', () => {
        const errors = validateSchema({ type: 'invalidType' });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('Invalid type "invalidType"');
        expect(errors[0].path).toBe('.type');
      });
    });

    describe('common properties', () => {
      it('should validate optional property', () => {
        const errors = validateSchema({ type: 'string', optional: true });
        expect(errors).toEqual([]);
      });

      it('should reject invalid optional property', () => {
        const errors = validateSchema({ type: 'string', optional: 'true' });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('Optional must be a boolean');
        expect(errors[0].path).toBe('.optional');
      });

      it('should validate nullable property', () => {
        const errors = validateSchema({ type: 'string', nullable: true });
        expect(errors).toEqual([]);
      });

      it('should reject invalid nullable property', () => {
        const errors = validateSchema({ type: 'string', nullable: 'true' });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('Nullable must be a boolean');
        expect(errors[0].path).toBe('.nullable');
      });

      it('should validate messages property', () => {
        const errors = validateSchema({
          type: 'string',
          messages: { required: 'Custom message' }
        });
        expect(errors).toEqual([]);
      });

      it('should reject invalid messages property', () => {
        const errors = validateSchema({ type: 'string', messages: 'invalid' });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('Messages must be an object');
        expect(errors[0].path).toBe('.messages');
      });

      it('should reject null messages property', () => {
        const errors = validateSchema({ type: 'string', messages: null });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('Messages must be an object');
        expect(errors[0].path).toBe('.messages');
      });
    });

    describe('string schema validation', () => {
      it('should validate all string properties', () => {
        const schema = {
          type: 'string',
          minLength: 5,
          maxLength: 10,
          equal: 'test',
          trim: true,
          trimLeft: true,
          trimRight: true,
          uppercase: true,
          lowercase: false,
          base64: true,
          uuid: false,
          phone: true,
          hex: false,
          pattern: /test/
        };
        const errors = validateSchema(schema);
        expect(errors).toEqual([]);
      });

      it('should validate string pattern as string', () => {
        const errors = validateSchema({ type: 'string', pattern: '^test$' });
        expect(errors).toEqual([]);
      });

      it('should reject invalid minLength', () => {
        const errors = validateSchema({ type: 'string', minLength: -1 });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('minLength must be a non-negative integer');
      });

      it('should reject non-integer minLength', () => {
        const errors = validateSchema({ type: 'string', minLength: 5.5 });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('minLength must be a non-negative integer');
      });

      it('should reject invalid maxLength', () => {
        const errors = validateSchema({ type: 'string', maxLength: 'invalid' });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('maxLength must be a non-negative integer');
      });

      it('should reject minLength > maxLength', () => {
        const errors = validateSchema({
          type: 'string',
          minLength: 10,
          maxLength: 5
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('minLength cannot be greater than maxLength');
        expect(errors[0].path).toBe('.minLength');
      });

      it('should reject invalid equal property', () => {
        const errors = validateSchema({ type: 'string', equal: 123 });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('equal must be a string');
      });

      it('should reject invalid boolean properties', () => {
        const boolProps = ['trim', 'trimLeft', 'trimRight', 'uppercase', 'lowercase', 'base64', 'uuid', 'phone', 'hex'];
        boolProps.forEach(prop => {
          const schema = { type: 'string', [prop]: 'invalid' };
          const errors = validateSchema(schema);
          expect(errors).toHaveLength(1);
          expect(errors[0].message).toContain(`${prop} must be a boolean`);
          expect(errors[0].path).toBe(`.${prop}`);
        });
      });

      it('should reject invalid pattern property', () => {
        const errors = validateSchema({ type: 'string', pattern: 123 });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('pattern must be a RegExp or string');
      });
    });

    describe('number schema validation', () => {
      it('should validate all number properties', () => {
        const schema = {
          type: 'number',
          min: 0,
          max: 100,
          equal: 50,
          notEqual: 25,
          integer: true,
          positive: false,
          negative: false
        };
        const errors = validateSchema(schema);
        expect(errors).toEqual([]);
      });

      it('should reject invalid numeric properties', () => {
        const numProps = ['min', 'max', 'equal', 'notEqual'];
        numProps.forEach(prop => {
          const schema = { type: 'number', [prop]: 'invalid' };
          const errors = validateSchema(schema);
          expect(errors).toHaveLength(1);
          expect(errors[0].message).toContain(`${prop} must be a number`);
          expect(errors[0].path).toBe(`.${prop}`);
        });
      });

      it('should reject min > max', () => {
        const errors = validateSchema({
          type: 'number',
          min: 100,
          max: 50
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('min cannot be greater than max');
        expect(errors[0].path).toBe('.min');
      });

      it('should reject invalid boolean properties', () => {
        const boolProps = ['integer', 'positive', 'negative'];
        boolProps.forEach(prop => {
          const schema = { type: 'number', [prop]: 'invalid' };
          const errors = validateSchema(schema);
          expect(errors).toHaveLength(1);
          expect(errors[0].message).toContain(`${prop} must be a boolean`);
          expect(errors[0].path).toBe(`.${prop}`);
        });
      });
    });

    describe('array schema validation', () => {
      it('should validate all array properties', () => {
        const schema = {
          type: 'array',
          minLength: 1,
          maxLength: 10,
          length: 5,
          contains: 'test',
          itemType: { type: 'string' }
        };
        const errors = validateSchema(schema);
        expect(errors).toEqual([]);
      });

      it('should reject invalid array length properties', () => {
        const lengthProps = ['minLength', 'maxLength', 'length'];
        lengthProps.forEach(prop => {
          const schema = { type: 'array', [prop]: -1 };
          const errors = validateSchema(schema);
          expect(errors).toHaveLength(1);
          expect(errors[0].message).toContain(`${prop} must be a non-negative integer`);
        });
      });

      it('should reject non-integer array length properties', () => {
        const lengthProps = ['minLength', 'maxLength', 'length'];
        lengthProps.forEach(prop => {
          const schema = { type: 'array', [prop]: 5.5 };
          const errors = validateSchema(schema);
          expect(errors).toHaveLength(1);
          expect(errors[0].message).toContain(`${prop} must be a non-negative integer`);
        });
      });

      it('should validate nested itemType schema', () => {
        const errors = validateSchema({
          type: 'array',
          itemType: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' }
            }
          }
        });
        expect(errors).toEqual([]);
      });

      it('should report errors in nested itemType schema', () => {
        const errors = validateSchema({
          type: 'array',
          itemType: { type: 'invalid' }
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].path).toBe('.itemType.type');
      });
    });

    describe('object schema validation', () => {
      it('should validate object with properties', () => {
        const schema = {
          type: 'object',
          strict: true,
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' }
              }
            }
          }
        };
        const errors = validateSchema(schema);
        expect(errors).toEqual([]);
      });

      it('should validate object with props (alternative)', () => {
        const schema = {
          type: 'object',
          props: {
            name: { type: 'string' }
          }
        };
        const errors = validateSchema(schema);
        expect(errors).toEqual([]);
      });

      it('should reject invalid strict property', () => {
        const errors = validateSchema({ type: 'object', strict: 'true' });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('strict must be a boolean');
        expect(errors[0].path).toBe('.strict');
      });

      it('should reject invalid properties', () => {
        const errors = validateSchema({ type: 'object', properties: 'invalid' });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('properties must be an object');
        expect(errors[0].path).toBe('.properties');
      });

      it('should reject null properties', () => {
        const errors = validateSchema({ type: 'object', properties: null });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('properties must be an object');
        expect(errors[0].path).toBe('.properties');
      });

      it('should validate nested property schemas', () => {
        const errors = validateSchema({
          type: 'object',
          properties: {
            validProp: { type: 'string' },
            invalidProp: { type: 'invalid' }
          }
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].path).toBe('.properties.invalidProp.type');
      });
    });

    describe('enum schema validation', () => {
      it('should validate enum with values', () => {
        const errors = validateSchema({
          type: 'enum',
          values: ['a', 'b', 'c', 1, 2, 3, true, false]
        });
        expect(errors).toEqual([]);
      });

      it('should reject enum without values', () => {
        const errors = validateSchema({ type: 'enum' });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('enum values must be an array');
        expect(errors[0].path).toBe('.values');
      });

      it('should reject enum with non-array values', () => {
        const errors = validateSchema({ type: 'enum', values: 'invalid' });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('enum values must be an array');
      });

      it('should reject enum with empty values array', () => {
        const errors = validateSchema({ type: 'enum', values: [] });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('enum values array cannot be empty');
        expect(errors[0].path).toBe('.values');
      });
    });

    describe('multi schema validation', () => {
      it('should validate multi with rules', () => {
        const errors = validateSchema({
          type: 'multi',
          rules: [
            { type: 'string' },
            { type: 'number' },
            { type: 'boolean' }
          ]
        });
        expect(errors).toEqual([]);
      });

      it('should reject multi without rules', () => {
        const errors = validateSchema({ type: 'multi' });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('multi rules must be an array');
        expect(errors[0].path).toBe('.rules');
      });

      it('should reject multi with non-array rules', () => {
        const errors = validateSchema({ type: 'multi', rules: 'invalid' });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('multi rules must be an array');
      });

      it('should reject multi with empty rules array', () => {
        const errors = validateSchema({ type: 'multi', rules: [] });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('multi rules array cannot be empty');
        expect(errors[0].path).toBe('.rules');
      });

      it('should validate nested rule schemas', () => {
        const errors = validateSchema({
          type: 'multi',
          rules: [
            { type: 'string', minLength: 1 },
            { type: 'invalid' }
          ]
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].path).toBe('.rules[1].type');
      });
    });

    describe('other type validations', () => {
      it('should validate basic types without extra properties', () => {
        const basicTypes = ['any', 'boolean', 'date', 'email', 'forbidden', 'url'];
        basicTypes.forEach(type => {
          const errors = validateSchema({ type });
          expect(errors).toEqual([]);
        });
      });

      it('should validate types with common properties', () => {
        const basicTypes = ['any', 'boolean', 'date', 'email', 'forbidden', 'url'];
        basicTypes.forEach(type => {
          const errors = validateSchema({
            type,
            optional: true,
            nullable: false,
            messages: { required: 'Custom message' }
          });
          expect(errors).toEqual([]);
        });
      });
    });

    describe('complex nested schemas', () => {
      it('should validate deeply nested schemas', () => {
        const errors = validateSchema({
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                profile: {
                  type: 'object',
                  properties: {
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
                }
              }
            }
          }
        });
        expect(errors).toEqual([]);
      });

      it('should report errors with correct nested paths', () => {
        const errors = validateSchema({
          type: 'object',
          properties: {
            level1: {
              type: 'object',
              properties: {
                level2: {
                  type: 'array',
                  itemType: {
                    type: 'invalid'
                  }
                }
              }
            }
          }
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].path).toBe('.properties.level1.properties.level2.itemType.type');
      });
    });
  });

  describe('validateOptions', () => {
    it('should validate valid options', () => {
      const options = {
        strict: true,
        strictMode: 'remove',
        root: false,
        validateSchema: true
      };
      const errors = validateOptions(options);
      expect(errors).toEqual([]);
    });

    it('should validate empty options', () => {
      const errors = validateOptions({});
      expect(errors).toEqual([]);
    });

    it('should reject null options', () => {
      const errors = validateOptions(null);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Options must be an object');
      expect(errors[0].path).toBe('options');
    });

    it('should reject undefined options', () => {
      const errors = validateOptions(undefined);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Options must be an object');
    });

    it('should reject string options', () => {
      const errors = validateOptions('invalid');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Options must be an object');
    });

    it('should reject invalid strict option', () => {
      const errors = validateOptions({ strict: 'true' });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('strict must be a boolean');
      expect(errors[0].path).toBe('options.strict');
    });

    it('should reject invalid strictMode', () => {
      const errors = validateOptions({ strictMode: 'invalid' });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('strictMode must be one of: remove, error');
      expect(errors[0].path).toBe('options.strictMode');
    });

    it('should validate both valid strictMode values', () => {
      const validModes = ['remove', 'error'];
      validModes.forEach(mode => {
        const errors = validateOptions({ strictMode: mode });
        expect(errors).toEqual([]);
      });
    });

    it('should reject invalid root option', () => {
      const errors = validateOptions({ root: 'false' });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('root must be a boolean');
      expect(errors[0].path).toBe('options.root');
    });

    it('should handle multiple invalid options', () => {
      const errors = validateOptions({
        strict: 'invalid',
        strictMode: 'invalid',
        root: 'invalid'
      });
      expect(errors).toHaveLength(3);
      expect(errors.map(e => e.path)).toEqual([
        'options.strict',
        'options.strictMode',
        'options.root'
      ]);
    });

    it('should allow unknown options without error', () => {
      const errors = validateOptions({
        strict: true,
        unknownOption: 'value',
        anotherUnknown: 123
      });
      expect(errors).toEqual([]);
    });
  });
});
