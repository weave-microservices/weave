const ModelValidator = require('../lib/validator');

describe('Validator test', () => {
  it('should throw an error if the schema is no object', () => {
    const schema = 'string';
    const validator = ModelValidator();

    const compileValidationSchema = () => {
      validator.compile(schema);
    };

    expect(compileValidationSchema).toThrowError('Invalid Schema.');
  });

  it('should throw an error on invalid custom validators', () => {
    const validator = ModelValidator();

    const addRule = () => {
      validator.addRule('has', {});
    };

    expect(addRule).toThrowError(new Error('Rule must be a function.'));
  });

  it('should call custom validator', () => {
    const schema = {
      id: { type: 'has' }
    };
    const validationHandler = jest.fn(() => ({ code: '' }));
    const parameters = { id: new Date(), name: 'kevin ries' };
    const validator = ModelValidator();

    validator.addRule('has', validationHandler);

    const validate = validator.compile(schema);
    const result = validate(parameters);

    expect(validationHandler.mock.calls.length).toBe(1);
    expect(result).toBe(true);
  });
});

describe('Validator test', () => {
  it('should throw an error if unkown validator is defined', () => {
    try {
      const schema = {
        id: { type: 'undefined!!' }
      };

      const parameters = { id: new Date(), name: 'kevin ries' };
      const validator = ModelValidator();
      const validate = validator.compile(schema);
      expect(validate).toThrow('');
      validate(parameters);
    } catch (error) {
      expect(error.message).toBe('Invalid type \'undefined!!\' in validator schema.');
    }
  });

  it('should validate', () => {
    const schema = {
      name: { type: 'string' }
    };

    const parameters = { name: '12345' };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const res = validate(parameters);
    expect(res).toBe(true);
  });

  it('should define a default value', () => {
    const defaultValue = 'Ulf';
    const schema = {
      name: { type: 'string', default: defaultValue }
    };

    const parameters = {};
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const res = validate(parameters);
    expect(parameters.name).toBe(defaultValue);
    expect(res).toBe(true);
  });

  it('should define a default value', () => {
    const defaultValue = 'Ulf';
    const schema = {
      name: { type: 'string', default: defaultValue }
    };

    const parameters = {};
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const res = validate(parameters);
    expect(parameters.name).toBe(defaultValue);
    expect(res).toBe(true);
  });

  it('should throw an error if the property type is missing.', () => {
    try {
      const schema = {
        name: { s: 'string' }
      };

      const validator = ModelValidator();
      validator.compile(schema);
    } catch (error) {
      expect(error.message).toBe('Property type is missing.');
    }
  });
});

describe('Multiple type validation', () => {
  it('should validate mutliple types per property.', () => {
    const schema = {
      name: [
        { type: 'string' },
        { type: 'number' }
      ]
    };

    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const res1 = validate({ name: 'kevin' });
    expect(res1).toBe(true);
    const res2 = validate({ name: 123 });
    expect(res2).toBe(true);

    const res3 = validate({ name: { text: 'kevin' }});

    expect(Array.isArray(res3)).toBe(true);
    expect(res3[0]).toEqual({
      field: 'name',
      message: 'The parameter "name" have to be a string.',
      passed: { text: 'kevin' },
      type: 'string'
    });
    expect(res3[1]).toEqual({
      field: 'name',
      message: 'The parameter "name" have to be a number.',
      passed: { text: 'kevin' },
      type: 'number'
    });
  });

  it('should validate root string value', () => {
    const schema = { type: 'number' };

    const parameters = 5;
    const validator = ModelValidator();
    const validate = validator.compile(schema, { root: true });
    const res = validate(parameters);
    expect(res).toBe(true);
  });
});

describe('Root property validation', () => {
  it('should validate root string value', () => {
    const schema = { type: 'string' };

    const parameters = 'kevin';
    const validator = ModelValidator();
    const validate = validator.compile(schema, { root: true });
    const res = validate(parameters);
    expect(res).toBe(true);
  });

  it('should validate root number value', () => {
    const schema = { type: 'number' };

    const parameters = 5;
    const validator = ModelValidator();
    const validate = validator.compile(schema, { root: true });
    const res = validate(parameters);
    expect(res).toBe(true);
  });
});

describe('Valdiate with strict mode', () => {
  it('should remove undefined properties (simple)', () => {
    const schema = {
      name: { type: 'string' },
      age: { type: 'number' }
    };

    const parameters = {
      name: 'kevin',
      age: 53,
      group: 'admin'
    };
    const validator = ModelValidator();
    const validate = validator.compile(schema, {
      strict: true,
      strictMode: 'remove'
    });
    const res = validate(parameters);
    expect(res).toBe(true);
    expect(parameters).toEqual({
      name: 'kevin',
      age: 53
    });
  });

  it('should remove undefined properties (nested)', () => {
    const schema = {
      name: { type: 'string' },
      age: { type: 'number' },
      items: { type: 'array', itemType: { type: 'object', props: {
        title: 'string'
      }}}
    };

    const parameters = {
      name: 'kevin',
      age: 53,
      group: 'admin',
      items: [{
        title: 'New task',
        date: new Date()
      }]
    };
    const validator = ModelValidator();
    const validate = validator.compile(schema, {
      strict: true,
      strictMode: 'remove'
    });
    const res = validate(parameters);
    expect(res).toBe(true);
    expect(parameters).toEqual({
      name: 'kevin',
      age: 53,
      items: [
        {
          title: 'New task'
        }
      ]
    });
  });

  it('should throw error on undefined properties (nested)', () => {
    const schema = {
      name: { type: 'string' },
      age: { type: 'number' },
      items: { type: 'array', itemType: { type: 'object', props: {
        title: 'string'
      }}}
    };

    const parameters = {
      name: 'kevin',
      age: 53,
      group: 'admin',
      items: [{
        title: 'New task',
        date: new Date()
      }]
    };

    const validator = ModelValidator();
    const validate = validator.compile(schema, {
      strict: true,
      strictMode: 'error'
    });

    const res = validate(parameters);

    expect(res[0]).toEqual({
      expected: 'title',
      field: 'items[0]',
      message: 'The object "items[0]" contains forbidden keys: "date".',
      passed: 'date',
      type: 'objectStrict'
    });

    expect(res[1]).toEqual({
      expected: 'name, age, items',
      field: '$root',
      message: 'The object "$root" contains forbidden keys: "group".',
      passed: 'group',
      type: 'objectStrict'
    });
  });
});
