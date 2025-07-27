/**
 * @fileoverview Schema validator to validate validator schemas themselves
 * This helps catch schema definition errors early before compilation
 * @author Kevin Ries <kevin.ries@fachwerk.io>
 * @version 0.14.0
 */

/**
 * Valid schema type identifiers supported by the validator
 * @type {string[]}
 * @constant
 */
const validTypes = [
  'any', 'array', 'boolean', 'date', 'email', 'enum',
  'forbidden', 'multi', 'number', 'object', 'string', 'url'
];

/**
 * Valid strict mode values for validation options
 * @type {string[]}
 * @constant
 */
const validStrictModes = ['remove', 'error'];

/**
 * Validation error object for schema validation
 * @typedef {Object} SchemaValidationError
 * @property {string} path - The path where the error occurred
 * @property {string} message - Descriptive error message
 */

/**
 * Validates a validation schema for correctness and compliance
 * @param {*} schema - The schema to validate (can be object, string, or array)
 * @param {string} [path=''] - Current path in schema for error reporting
 * @returns {SchemaValidationError[]} Array of validation errors (empty if valid)
 * @example
 * const errors = validateSchema({ type: 'string', minLength: 1 });
 * if (errors.length > 0) {
 *   console.log('Schema validation failed:', errors);
 * }
 */
function validateSchema (schema, path = '') {
  const errors = [];

  if (typeof schema === 'string') {
    // String shorthand
    if (!validTypes.includes(schema)) {
      errors.push({
        path,
        message: `Invalid type "${schema}". Valid types: ${validTypes.join(', ')}`
      });
    }
    return errors;
  }

  if (Array.isArray(schema)) {
    // Multi-type schema
    if (schema.length === 0) {
      errors.push({
        path,
        message: 'Multi-type schema array cannot be empty'
      });
    } else {
      schema.forEach((subSchema, index) => {
        errors.push(...validateSchema(subSchema, `${path}[${index}]`));
      });
    }
    return errors;
  }

  if (typeof schema !== 'object' || schema === null) {
    errors.push({
      path,
      message: 'Schema must be an object, string, or array'
    });
    return errors;
  }

  // Validate type property
  if (!schema.type) {
    errors.push({
      path: `${path}.type`,
      message: 'Schema must have a "type" property'
    });
  } else if (!validTypes.includes(schema.type)) {
    errors.push({
      path: `${path}.type`,
      message: `Invalid type "${schema.type}". Valid types: ${validTypes.join(', ')}`
    });
  }

  // Type-specific validations
  switch (schema.type) {
  case 'string':
    validateStringSchema(schema, path, errors);
    break;
  case 'number':
    validateNumberSchema(schema, path, errors);
    break;
  case 'array':
    validateArraySchema(schema, path, errors);
    break;
  case 'object':
    validateObjectSchema(schema, path, errors);
    break;
  case 'enum':
    validateEnumSchema(schema, path, errors);
    break;
  case 'multi':
    validateMultiSchema(schema, path, errors);
    break;
  }

  // Common validations
  if (schema.optional !== undefined && typeof schema.optional !== 'boolean') {
    errors.push({
      path: `${path}.optional`,
      message: 'Optional must be a boolean'
    });
  }

  if (schema.nullable !== undefined && typeof schema.nullable !== 'boolean') {
    errors.push({
      path: `${path}.nullable`,
      message: 'Nullable must be a boolean'
    });
  }

  if (schema.messages !== undefined && (typeof schema.messages !== 'object' || schema.messages === null)) {
    errors.push({
      path: `${path}.messages`,
      message: 'Messages must be an object'
    });
  }

  return errors;
}

/**
 * Validates string-specific schema properties
 * @param {Object} schema - String schema object to validate
 * @param {string} path - Current path for error reporting
 * @param {SchemaValidationError[]} errors - Array to collect validation errors
 * @private
 */
function validateStringSchema (schema, path, errors) {
  const numericProps = ['minLength', 'maxLength'];
  numericProps.forEach(prop => {
    if (schema[prop] !== undefined) {
      if (typeof schema[prop] !== 'number' || schema[prop] < 0 || !Number.isInteger(schema[prop])) {
        errors.push({
          path: `${path}.${prop}`,
          message: `${prop} must be a non-negative integer`
        });
      }
    }
  });

  if (schema.minLength !== undefined && schema.maxLength !== undefined) {
    if (schema.minLength > schema.maxLength) {
      errors.push({
        path: `${path}.minLength`,
        message: 'minLength cannot be greater than maxLength'
      });
    }
  }

  const booleanProps = ['trim', 'trimLeft', 'trimRight', 'uppercase', 'lowercase', 'base64', 'uuid', 'phone', 'hex'];
  booleanProps.forEach(prop => {
    if (schema[prop] !== undefined && typeof schema[prop] !== 'boolean') {
      errors.push({
        path: `${path}.${prop}`,
        message: `${prop} must be a boolean`
      });
    }
  });

  if (schema.equal !== undefined && typeof schema.equal !== 'string') {
    errors.push({
      path: `${path}.equal`,
      message: 'equal must be a string'
    });
  }

  if (schema.pattern !== undefined) {
    if (!(schema.pattern instanceof RegExp) && typeof schema.pattern !== 'string') {
      errors.push({
        path: `${path}.pattern`,
        message: 'pattern must be a RegExp or string'
      });
    }
  }
}

/**
 * Validates number-specific schema properties
 * @param {Object} schema - Number schema object to validate
 * @param {string} path - Current path for error reporting
 * @param {SchemaValidationError[]} errors - Array to collect validation errors
 * @private
 */
function validateNumberSchema (schema, path, errors) {
  const numericProps = ['min', 'max', 'equal', 'notEqual'];
  numericProps.forEach(prop => {
    if (schema[prop] !== undefined && typeof schema[prop] !== 'number') {
      errors.push({
        path: `${path}.${prop}`,
        message: `${prop} must be a number`
      });
    }
  });

  if (schema.min !== undefined && schema.max !== undefined) {
    if (schema.min > schema.max) {
      errors.push({
        path: `${path}.min`,
        message: 'min cannot be greater than max'
      });
    }
  }

  const booleanProps = ['integer', 'positive', 'negative'];
  booleanProps.forEach(prop => {
    if (schema[prop] !== undefined && typeof schema[prop] !== 'boolean') {
      errors.push({
        path: `${path}.${prop}`,
        message: `${prop} must be a boolean`
      });
    }
  });
}

/**
 * Validates array-specific schema properties
 * @param {Object} schema - Array schema object to validate
 * @param {string} path - Current path for error reporting
 * @param {SchemaValidationError[]} errors - Array to collect validation errors
 * @private
 */
function validateArraySchema (schema, path, errors) {
  const numericProps = ['minLength', 'maxLength', 'length'];
  numericProps.forEach(prop => {
    if (schema[prop] !== undefined) {
      if (typeof schema[prop] !== 'number' || schema[prop] < 0 || !Number.isInteger(schema[prop])) {
        errors.push({
          path: `${path}.${prop}`,
          message: `${prop} must be a non-negative integer`
        });
      }
    }
  });

  if (schema.itemType !== undefined) {
    errors.push(...validateSchema(schema.itemType, `${path}.itemType`));
  }
}

/**
 * Validates object-specific schema properties
 * @param {Object} schema - Object schema to validate
 * @param {string} path - Current path for error reporting
 * @param {SchemaValidationError[]} errors - Array to collect validation errors
 * @private
 */
function validateObjectSchema (schema, path, errors) {
  if (schema.strict !== undefined && typeof schema.strict !== 'boolean') {
    errors.push({
      path: `${path}.strict`,
      message: 'strict must be a boolean'
    });
  }

  // Check properties and props separately to handle null values correctly
  if (schema.properties !== undefined) {
    if (typeof schema.properties !== 'object' || schema.properties === null) {
      errors.push({
        path: `${path}.properties`,
        message: 'properties must be an object'
      });
    } else {
      Object.keys(schema.properties).forEach(key => {
        errors.push(...validateSchema(schema.properties[key], `${path}.properties.${key}`));
      });
    }
  } else if (schema.props !== undefined) {
    if (typeof schema.props !== 'object' || schema.props === null) {
      errors.push({
        path: `${path}.properties`,
        message: 'properties must be an object'
      });
    } else {
      Object.keys(schema.props).forEach(key => {
        errors.push(...validateSchema(schema.props[key], `${path}.properties.${key}`));
      });
    }
  }
}

/**
 * Validates enum-specific schema properties
 * @param {Object} schema - Enum schema to validate
 * @param {string} path - Current path for error reporting
 * @param {SchemaValidationError[]} errors - Array to collect validation errors
 * @private
 */
function validateEnumSchema (schema, path, errors) {
  if (!Array.isArray(schema.values)) {
    errors.push({
      path: `${path}.values`,
      message: 'enum values must be an array'
    });
  } else if (schema.values.length === 0) {
    errors.push({
      path: `${path}.values`,
      message: 'enum values array cannot be empty'
    });
  }
}

/**
 * Validates multi-type schema properties (union schemas)
 * @param {Object} schema - Multi schema to validate
 * @param {string} path - Current path for error reporting
 * @param {SchemaValidationError[]} errors - Array to collect validation errors
 * @private
 */
function validateMultiSchema (schema, path, errors) {
  if (!Array.isArray(schema.rules)) {
    errors.push({
      path: `${path}.rules`,
      message: 'multi rules must be an array'
    });
  } else if (schema.rules.length === 0) {
    errors.push({
      path: `${path}.rules`,
      message: 'multi rules array cannot be empty'
    });
  } else {
    schema.rules.forEach((rule, index) => {
      errors.push(...validateSchema(rule, `${path}.rules[${index}]`));
    });
  }
}

/**
 * Options validation error object
 * @typedef {Object} OptionsValidationError
 * @property {string} path - The path where the error occurred
 * @property {string} message - Descriptive error message
 */

/**
 * Validates validation options for correctness
 * @param {*} options - Options object to validate
 * @returns {OptionsValidationError[]} Array of validation errors (empty if valid)
 * @example
 * const errors = validateOptions({ strict: true, strictMode: 'remove' });
 * if (errors.length > 0) {
 *   console.log('Options validation failed:', errors);
 * }
 */
function validateOptions (options) {
  const errors = [];

  if (typeof options !== 'object' || options === null) {
    errors.push({
      path: 'options',
      message: 'Options must be an object'
    });
    return errors;
  }

  if (options.strict !== undefined && typeof options.strict !== 'boolean') {
    errors.push({
      path: 'options.strict',
      message: 'strict must be a boolean'
    });
  }

  if (options.strictMode !== undefined && !validStrictModes.includes(options.strictMode)) {
    errors.push({
      path: 'options.strictMode',
      message: `strictMode must be one of: ${validStrictModes.join(', ')}`
    });
  }

  if (options.root !== undefined && typeof options.root !== 'boolean') {
    errors.push({
      path: 'options.root',
      message: 'root must be a boolean'
    });
  }

  return errors;
}

/**
 * @module SchemaValidator
 * @description Schema validation utilities for the Weave validator library
 */
module.exports = {
  /**
   * Validates a validation schema for correctness and compliance
   * @function
   */
  validateSchema,
  /**
   * Validates validation options for correctness
   * @function
   */
  validateOptions
};
