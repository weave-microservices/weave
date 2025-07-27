# Weave Validator

[![NPM Version](https://img.shields.io/npm/v/@weave-js/validator.svg)](https://www.npmjs.com/package/@weave-js/validator)
[![Build Status](https://travis-ci.com/weave-microservices/weave.svg?branch=master)](https://travis-ci.com/weave-microservices/weave)
[![Downloads](https://img.shields.io/npm/dt/@weave-js/validator.svg)](https://www.npmjs.com/package/@weave-js/validator)

> Fast and flexible object validation library for Node.js

## Features

- 🚀 **High Performance**: Uses code generation for optimal runtime performance
- 📝 **Rich Schema Support**: Comprehensive validation rules for all common data types
- 🔧 **Extensible**: Add custom validation rules easily
- 📋 **TypeScript Support**: Full TypeScript definitions included
- 🎯 **Strict Mode**: Object validation with configurable strict mode behavior
- 🔄 **Data Transformation**: Built-in sanitization and transformation capabilities

## Installation

```bash
npm install @weave-js/validator
```

## Quick Start

```javascript
const ModelValidator = require('@weave-js/validator');

// Create validator instance
const validator = ModelValidator();

// Define schema
const schema = {
  name: { type: 'string', minLength: 2, maxLength: 50 },
  email: { type: 'email' },
  age: { type: 'number', min: 0, max: 120, integer: true },
  isActive: { type: 'boolean', optional: true }
};

// Compile validation function
const validate = validator.compile(schema);

// Validate data
const result = validate({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  isActive: true
});

console.log(result); // true (if valid) or array of error objects
```

## Schema Types

### String Validation

```javascript
const stringSchema = {
  username: {
    type: 'string',
    minLength: 3,
    maxLength: 20,
    trim: true,
    lowercase: true
  },
  password: {
    type: 'string',
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  },
  userId: {
    type: 'string',
    uuid: true
  },
  phone: {
    type: 'string',
    phone: true
  },
  apiKey: {
    type: 'string',
    hex: true
  },
  encodedData: {
    type: 'string',
    base64: true
  }
};
```

### Number Validation

```javascript
const numberSchema = {
  price: {
    type: 'number',
    min: 0,
    positive: true
  },
  quantity: {
    type: 'number',
    integer: true,
    min: 1,
    max: 1000
  },
  discount: {
    type: 'number',
    min: 0,
    max: 100,
    default: 0
  }
};
```

### Array Validation

```javascript
const arraySchema = {
  tags: {
    type: 'array',
    minLength: 1,
    maxLength: 10,
    itemType: { type: 'string', minLength: 1 }
  },
  scores: {
    type: 'array',
    length: 5,
    itemType: { type: 'number', min: 0, max: 100 }
  },
  categories: {
    type: 'array',
    contains: 'required-category'
  }
};
```

### Object Validation

```javascript
const objectSchema = {
  user: {
    type: 'object',
    strict: true,
    properties: {
      id: { type: 'string', uuid: true },
      profile: {
        type: 'object',
        properties: {
          firstName: { type: 'string', minLength: 1 },
          lastName: { type: 'string', minLength: 1 },
          birthDate: { type: 'date' }
        }
      }
    }
  }
};
```

### Enum Validation

```javascript
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
```

### Multi-Type Validation

```javascript
const multiSchema = {
  value: [
    { type: 'string' },
    { type: 'number' }
  ]
};

// Alternative syntax
const multiSchema2 = {
  value: {
    type: 'multi',
    rules: [
      { type: 'string' },
      { type: 'number' }
    ]
  }
};
```

## Validation Options

```javascript
const options = {
  strict: true,           // Enable strict mode for objects
  strictMode: 'remove',   // 'remove' | 'error'
  root: false            // Validate root value directly
};

const validate = validator.compile(schema, options);
```

### Strict Mode

- `strict: true, strictMode: 'remove'` - Remove extra properties from objects
- `strict: true, strictMode: 'error'` - Return validation error for extra properties

## Custom Validation Rules

```javascript
const validator = ModelValidator();

// Add custom rule
validator.addRule('creditCard', function({ schema, messages }) {
  const code = [`
    if (typeof value !== 'string') {
      ${this.makeErrorCode({ type: 'string', passed: 'value', messages })}
      return value;
    }
    
    // Luhn algorithm validation
    const digits = value.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) {
      ${this.makeErrorCode({ type: 'creditCardInvalid', passed: 'value', messages })}
      return value;
    }
    
    // Additional Luhn validation logic here...
    return value;
  `];
  
  return { code: code.join('\n') };
});

// Use custom rule
const schema = {
  cardNumber: { type: 'creditCard' }
};
```

## Error Handling

Validation returns either `true` for success or an array of error objects:

```javascript
const result = validate({ name: '' });

if (result !== true) {
  result.forEach(error => {
    console.log(`Field: ${error.field}`);
    console.log(`Type: ${error.type}`);
    console.log(`Message: ${error.message}`);
    console.log(`Expected: ${error.expected}`);
    console.log(`Passed: ${error.passed}`);
  });
}
```

## Advanced Features

### Optional and Nullable Fields

```javascript
const schema = {
  optionalField: { type: 'string', optional: true },
  nullableField: { type: 'string', nullable: true },
  withDefault: { type: 'number', default: 42 }
};
```

### Data Transformation

```javascript
const schema = {
  name: { type: 'string', trim: true, uppercase: true },
  email: { type: 'string', trim: true, lowercase: true }
};
```

### Custom Error Messages

```javascript
const schema = {
  age: {
    type: 'number',
    min: 18,
    messages: {
      numberMin: 'You must be at least 18 years old'
    }
  }
};
```

## TypeScript Usage

```typescript
import ModelValidator, { Schema, ValidationResult } from '@weave-js/validator';

const validator = ModelValidator();

const schema: Schema = {
  name: { type: 'string', minLength: 1 },
  age: { type: 'number', min: 0 }
};

const validate = validator.compile(schema);
const result: ValidationResult = validate({ name: 'John', age: 30 });
```

## Performance

The validator uses code generation to create optimized validation functions:

```javascript
// Schema is compiled once
const validate = validator.compile(schema);

// Generated function executes very fast
for (let i = 0; i < 1000000; i++) {
  validate(data); // Optimized runtime performance
}
```

## API Reference

### ModelValidator()

Creates a new validator instance.

### validator.compile(schema, options?)

Compiles a schema into a validation function.

- `schema`: Validation schema object
- `options`: Optional validation options
- Returns: Validation function

### validator.validate(data, schema)

One-time validation (compiles and validates).

- `data`: Data to validate
- `schema`: Validation schema
- Returns: Validation result

### validator.addRule(typeName, ruleFunction)

Adds a custom validation rule.

- `typeName`: Name of the rule type
- `ruleFunction`: Rule implementation function

## License

Copyright (c) 2020 [Weave contributors](https://github.com/weave-microservices/weave/graphs/contributors)

Licensed under the [MIT license](LICENSE).