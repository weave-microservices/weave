const defaultMessages = require('./messages');
const { validateSchema, validateOptions } = require('./schemaValidator');

/**
 * @fileoverview Weave Validator - High-performance schema validation library using code generation
 * @author Kevin Ries <kevin.ries@fachwerk.io>
 * @version 0.14.0
 */

/**
 * Validation options for controlling validator behavior
 * @typedef {Object} ValidationOptions
 * @property {boolean} [strict=true] - Enables strict mode for object validation
 * @property {'remove'|'error'} [strictMode='remove'] - Behavior when extra properties found: 'remove' deletes them, 'error' fails validation
 * @property {boolean} [root=false] - Whether to validate the root value directly instead of wrapping in object
 * @property {boolean} [validateSchema=false] - Whether to validate the schema structure before compilation
 */

/**
 * Validation error object returned when validation fails
 * @typedef {Object} ValidationError
 * @property {string} type - The type of validation error (e.g., 'required', 'string', 'number')
 * @property {string} message - Human-readable error message with placeholders replaced
 * @property {string} [field] - The field path where the error occurred
 * @property {*} [expected] - The expected value or constraint
 * @property {*} [passed] - The actual value that was passed
 */

/**
 * Result of validation - either success (true) or array of errors
 * @typedef {true|ValidationError[]} ValidationResult
 */

/**
 * Compiled validation function that validates data against a schema
 * @callback ValidationFunction
 * @param {*} data - The data to validate
 * @returns {ValidationResult} - True if valid, array of ValidationError objects if invalid
 */

/**
 * Base schema properties available to all validation types
 * @typedef {Object} BaseSchema
 * @property {string} type - The validation type (string, number, boolean, etc.)
 * @property {boolean} [optional=false] - Whether the field is optional (allows undefined)
 * @property {boolean} [nullable=false] - Whether the field is nullable (allows null)
 * @property {*} [default] - Default value to use if field is undefined
 * @property {Object<string, string>} [messages] - Custom error messages for this field
 */

/**
 * String validation schema
 * @typedef {Object} StringSchema
 * @extends BaseSchema
 * @property {'string'} type - Must be 'string'
 * @property {number} [minLength] - Minimum string length
 * @property {number} [maxLength] - Maximum string length
 * @property {string} [equal] - Exact string value required
 * @property {boolean} [trim=false] - Trim whitespace from both ends
 * @property {boolean} [trimLeft=false] - Trim whitespace from start (deprecated, use trimStart)
 * @property {boolean} [trimRight=false] - Trim whitespace from end (deprecated, use trimEnd)
 * @property {boolean} [uppercase=false] - Convert to uppercase
 * @property {boolean} [lowercase=false] - Convert to lowercase
 * @property {boolean} [base64=false] - Validate as base64 string
 * @property {boolean} [uuid=false] - Validate as UUID format
 * @property {boolean} [phone=false] - Validate as phone number
 * @property {boolean} [hex=false] - Validate as hexadecimal string
 * @property {RegExp|string} [pattern] - Custom regex pattern to match
 */

/**
 * Number validation schema
 * @typedef {Object} NumberSchema
 * @extends BaseSchema
 * @property {'number'} type - Must be 'number'
 * @property {number} [min] - Minimum numeric value
 * @property {number} [max] - Maximum numeric value
 * @property {number} [equal] - Exact numeric value required
 * @property {number} [notEqual] - Value that is not allowed
 * @property {boolean} [integer=false] - Must be an integer
 * @property {boolean} [positive=false] - Must be positive (> 0)
 * @property {boolean} [negative=false] - Must be negative (< 0)
 */

/**
 * Array validation schema
 * @typedef {Object} ArraySchema
 * @extends BaseSchema
 * @property {'array'} type - Must be 'array'
 * @property {number} [minLength] - Minimum array length
 * @property {number} [maxLength] - Maximum array length
 * @property {number} [length] - Exact array length required
 * @property {*} [contains] - Value that must be present in array
 * @property {Schema} [itemType] - Schema to validate each array item against
 */

/**
 * Object validation schema
 * @typedef {Object} ObjectSchema
 * @extends BaseSchema
 * @property {'object'} type - Must be 'object'
 * @property {boolean} [strict=false] - Whether to allow extra properties
 * @property {Object<string, Schema>} [properties] - Schema for each object property
 * @property {Object<string, Schema>} [props] - Alias for properties
 */

/**
 * Enum validation schema
 * @typedef {Object} EnumSchema
 * @extends BaseSchema
 * @property {'enum'} type - Must be 'enum'
 * @property {*[]} values - Array of allowed values
 */

/**
 * Multi-type validation schema (union types)
 * @typedef {Object} MultiSchema
 * @extends BaseSchema
 * @property {'multi'} type - Must be 'multi'
 * @property {Schema[]} rules - Array of schemas, value must match at least one
 */

/**
 * Validation schema - can be a schema object, string shorthand, or array of schemas
 * @typedef {StringSchema|NumberSchema|ArraySchema|ObjectSchema|EnumSchema|MultiSchema|BaseSchema|string|Schema[]} Schema
 */

/**
 * Model validator instance with validation methods
 * @typedef {Object} ModelValidator
 * @property {function(Schema, ValidationOptions=): ValidationFunction} compile - Compile schema into validation function
 * @property {function(*, Schema): ValidationResult} validate - One-time validation without compilation
 * @property {function(string, Function): void} addRule - Add custom validation rule type
 */

/**
 * Creates a new model validator instance with code generation for high-performance validation
 *
 * @example
 * // Basic usage
 * const ModelValidator = require('@weave-js/validator');
 * const validator = ModelValidator();
 *
 * const schema = {
 *   name: { type: 'string', minLength: 1 },
 *   age: { type: 'number', min: 0, integer: true }
 * };
 *
 * const validate = validator.compile(schema);
 * const result = validate({ name: 'John', age: 30 });
 * console.log(result); // true or array of errors
 *
 * @example
 * // With options
 * const validate = validator.compile(schema, {
 *   strict: true,
 *   strictMode: 'error'
 * });
 *
 * @example
 * // Custom validation rule
 * validator.addRule('creditCard', function({ schema, messages }) {
 *   return {
 *     code: `
 *       if (typeof value !== 'string' || !isValidCreditCard(value)) {
 *         ${this.makeErrorCode({ type: 'creditCard', passed: 'value', messages })}
 *         return value;
 *       }
 *       return value;
 *     `
 *   };
 * });
 *
 * @returns {ModelValidator} A new validator instance
 */
function ModelValidator () {
  const messages = defaultMessages;
  const cache = new Map();

  // Load rules
  const rules = {
    any: require('./rules/any'),
    array: require('./rules/array'),
    boolean: require('./rules/boolean'),
    date: require('./rules/date'),
    email: require('./rules/email'),
    enum: require('./rules/enum'),
    forbidden: require('./rules/forbidden'),
    multi: require('./rules/multi'),
    number: require('./rules/number'),
    object: require('./rules/object'),
    string: require('./rules/string'),
    url: require('./rules/url')
  };

  const internal = {
    /**
     * Generates code snippet for creating validation error objects
     * @param {Object} errorInfo - Error information
     * @param {string} errorInfo.type - The type of validation error
     * @param {*} [errorInfo.expected] - Expected value or constraint
     * @param {string} [errorInfo.field] - Field path where error occurred
     * @param {*} [errorInfo.passed] - Actual value that was passed
     * @param {Object} errorInfo.messages - Error message templates
     * @returns {string} Generated code snippet for pushing error to errors array
     */
    makeErrorCode ({ type, expected, field, passed, messages }) {
      const error = {
        type: `'${type}'`,
        message: `'${messages[type]}'`
      };

      if (field) {
        error.field = `'${field}'`;
      } else {
        error.field = 'field';
      }

      if (expected) {
        error.expected = expected;
      }

      if (passed) {
        error.passed = passed;
      }

      // Error object to string
      const str = Object.keys(error)
        .map(key => `${key}: ${error[key]}`)
        .join(', ');

      // Push error object content to errors
      return `errors.push({ ${str} })`;
    },
    /**
     * Converts schema shorthand formats to standardized rule objects
     * @param {Schema} schema - The schema definition (object, string, or array)
     * @returns {Object} Rule object with schema, ruleGeneratorFunction, and messages
     * @throws {Error} When schema is invalid or missing required properties
     */
    getRuleFromSchema (schema) {
      if (typeof schema === 'string') {
        schema = {
          type: schema
        };
      } else if (Array.isArray(schema)) {
        if (schema.length === 0) {
          throw new Error('Invalid schema.');
        }

        schema = {
          type: 'multi',
          rules: schema
        };

        // todo: handle optionals
        schema.optional = schema.rules
          .map(s => internal.getRuleFromSchema(s))
          .every(r => r.schema.optional === true);
      }

      if (!schema.type) {
        throw new Error('Property type is missing.');
      }

      const ruleGeneratorFunction = rules[schema.type];

      if (!ruleGeneratorFunction) {
        throw new Error(`Invalid type '${schema.type}' in validator schema.`);
      }

      return {
        schema,
        ruleGeneratorFunction,
        messages: Object.assign({}, messages, schema.messages)
      };
    },
    /**
     * Compiles individual validation rules into executable JavaScript code
     * @param {Object} rule - Rule object containing schema and generator function
     * @param {Object} context - Compilation context with options and rule cache
     * @param {string|null} path - Current field path for error reporting
     * @param {string} innerSrc - Template code for rule execution
     * @param {string} sourceVar - Variable name for the source value
     * @returns {string} Generated JavaScript code for the validation rule
     */
    compileRule (rule, context, path, innerSrc, sourceVar) {
      const sourceCode = [];

      if (rule.schema.type === 'object') {
        rule.schema.strict = !!context.options.strict;
      }

      const item = cache.get(rule.schema);

      if (item) {

      } else {
        rule.index = context.index;
        context.rules[context.index] = rule;
        context.index++;

        const result = rule.ruleGeneratorFunction.call(internal, rule, path, context);

        if (result.code) {
          context.func[rule.index] = new Function('value', 'field', 'parent', 'errors', 'context', result.code);
          sourceCode.push(this.wrapSourceCode(rule, context, innerSrc.replace('##INDEX##', rule.index), sourceVar));
        } else {
          sourceCode.push(this.wrapSourceCode(rule, context));
        }
      }

      return sourceCode.join('\n');
    },
    /**
     * Main compilation method that transforms schemas into optimized validation functions
     * @param {Schema} schema - The validation schema to compile
     * @param {ValidationOptions} [options={}] - Validation options
     * @returns {ValidationFunction} Compiled validation function
     * @throws {Error} When schema or options are invalid
     */
    compile (schema, options = {}) {
      options = Object.assign({
        strict: true,
        strictMode: 'remove',
        root: false,
        validateSchema: false
      }, options);

      // Validate options (if requested)
      if (options.validateSchema) {
        const optionErrors = validateOptions(options);
        if (optionErrors.length > 0) {
          const errorMessages = optionErrors.map(e => `${e.path}: ${e.message}`).join('; ');
          throw new Error(`Invalid validation options: ${errorMessages}`);
        }

        // Validate the original schema before transformation
        let schemaToValidate;
        if (options.root === true) {
          schemaToValidate = schema;
        } else if (Array.isArray(schema)) {
          schemaToValidate = schema;
        } else if (typeof schema === 'string') {
          schemaToValidate = schema;
        } else {
          // For object schemas, validate each property individually
          const errors = [];
          Object.keys(schema).forEach(key => {
            const propErrors = validateSchema(schema[key], `.${key}`);
            errors.push(...propErrors);
          });
          if (errors.length > 0) {
            const errorMessages = errors.map(e => `${e.path}: ${e.message}`).join('; ');
            throw new Error(`Invalid schema: ${errorMessages}`);
          }
          // Skip the general schema validation since we validated properties individually
          schemaToValidate = null;
        }
        if (schemaToValidate !== null) {
          const schemaErrors = validateSchema(schemaToValidate);
          if (schemaErrors.length > 0) {
            const errorMessages = schemaErrors.map(e => `${e.path}: ${e.message}`).join('; ');
            throw new Error(`Invalid schema: ${errorMessages}`);
          }
        }
      }

      if (typeof schema !== 'object' && typeof schema !== 'string' && !Array.isArray(schema)) {
        throw new Error('Invalid Schema.');
      }

      // Special case: if root mode is false and schema is just a string, it's invalid for object validation
      if (options.root === false && typeof schema === 'string') {
        throw new Error('Invalid Schema.');
      }

      const self = this;

      // define
      const context = {
        index: 0,
        rules: [],
        func: [],
        options: {
          ...options
        }
      };

      cache.clear();

      const code = [
        'const errors = []',
        'let field'
      ];

      // prepare schema
      if (options.root !== true) {
        // Root validator is an array (Multiple types)
        if (Array.isArray(schema)) {
          const rule = internal.getRuleFromSchema(schema);
          schema = rule.schema;
        } else {
          const tempSchema = Object.assign({}, schema);
          schema = {
            type: 'object',
            strict: context.options.strict || false,
            props: tempSchema
          };
        }
      }

      const rule = internal.getRuleFromSchema(schema);

      code.push(internal.compileRule(rule, context, null, 'context.func[##INDEX##](value, field, null, errors, context)', 'value'));
      code.push('if (errors.length) {');
      code.push(`
        return errors.map(error => {
          if (error.message) {
            error.message = error.message
              .replace(/\\{param\\}/g, error.field || '')
              .replace(/\\{expected\\}/g, error.expected != null ? error.expected : '')
              .replace(/\\{passed\\}/g, error.passed != null ? error.passed : '')
          }

          return error
        })
      `);
      code.push('}');
      code.push('return true');

      const src = code.join('\n');
      const checkFn = new Function('value', 'context', src);

      return function (data) {
        context.data = data;
        return checkFn.call(self, data, context);
      };
    },
    /**
     * Wraps validation rule code with null/undefined handling and default value logic
     * @param {Object} rule - Rule object with schema and validation logic
     * @param {Object} context - Compilation context (unused but kept for compatibility)
     * @param {string} [innerSrc] - Inner validation code template
     * @param {string} [resolveVar] - Variable to assign resolved default values
     * @returns {string} Generated JavaScript code with null/undefined handling
     */
    wrapSourceCode (rule, context, innerSrc, resolveVar) {
      const code = [];
      let handleValue = '';
      let skipUndefinedValue = rule.schema.optional === true || rule.schema.type === 'forbidden';
      const skipNullValue = rule.schema.optional === true || rule.schema.nullable === true || rule.schema.type === 'forbidden';

      if (rule.schema.default != null) {
        let defaultValue;
        skipUndefinedValue = false;

        // handle dynamic default value
        if (typeof rule.schema.default === 'function') {

        } else {
          defaultValue = JSON.stringify(rule.schema.default);
        }

        handleValue = `
          value = ${defaultValue}
          ${resolveVar} = value
        `;
      } else {
        handleValue = this.makeErrorCode({ type: 'required', passed: 'value', messages: rule.messages });
      }
      code.push(`
        ${`if (value === undefined) { ${skipUndefinedValue ? '\n // allow undefined value\n' : handleValue} }`}
        ${`else if (value === null) {  ${skipNullValue ? '\n // allow null value\n' : handleValue} }`}
        ${innerSrc ? `else { ${innerSrc} }` : ''}
      `);

      return code.join('\n');
    }
  };

  return {
    /**
     * Compiles a validation schema into an optimized validation function
     * @type {function(Schema, ValidationOptions=): ValidationFunction}
     */
    compile: internal.compile,

    /**
     * Validates data against a schema without compilation caching (one-time use)
     * @param {*} obj - The data to validate
     * @param {Schema} schema - The validation schema
     * @returns {ValidationResult} True if valid, array of ValidationError objects if invalid
     * @example
     * const validator = ModelValidator();
     * const result = validator.validate({ name: 'John' }, { name: { type: 'string' } });
     * console.log(result); // true or array of errors
     */
    validate (obj, schema) {
      const check = internal.compile(schema);
      return check(obj);
    },

    /**
     * Adds a custom validation rule type to the validator
     * @param {string} typeName - Name of the new validation type
     * @param {Function} ruleFn - Rule generator function that returns validation code
     * @throws {Error} When ruleFn is not a function
     * @example
     * validator.addRule('creditCard', function({ schema, messages }) {
     *   return {
     *     code: `
     *       if (typeof value !== 'string' || !isValidCreditCard(value)) {
     *         ${this.makeErrorCode({ type: 'creditCard', passed: 'value', messages })}
     *         return value;
     *       }
     *       return value;
     *     `
     *   };
     * });
     */
    addRule (typeName, ruleFn) {
      if (typeof ruleFn !== 'function') {
        throw new Error('Rule must be a function.');
      }
      rules[typeName] = ruleFn;
    }
  };
}

module.exports = ModelValidator;
