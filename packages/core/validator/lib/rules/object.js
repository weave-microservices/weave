/**
 * @fileoverview Object validation rule generator for Weave validator
 * Generates optimized validation code for object type schemas
 * @author Kevin Ries <kevin.ries@fachwerk.io>
 * @version 0.14.0
 */

/**
 * Regular expression to match valid JavaScript identifiers for property access optimization
 * Unmatched property names will be quoted and validate slightly slower.
 * @see {@link https://www.ecma-international.org/ecma-262/5.1/#sec-7.6}
 * @type {RegExp}
 * @constant
 */
const identifierRegex = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/;
const { escapeEvalString } = require('../utils/escapeEvalString');

/**
 * Object validation rule generator function
 * @typedef {Object} ObjectValidationContext
 * @property {Object} schema - Object schema configuration
 * @property {boolean} [schema.strict] - Whether to enforce strict property validation
 * @property {Object} [schema.properties] - Schema for each object property
 * @property {Object} [schema.props] - Alias for properties
 * @property {Object} messages - Error message templates
 *
 * @typedef {Object} ObjectValidationResult
 * @property {string} code - Generated JavaScript validation code
 *
 * @param {ObjectValidationContext} context - Validation context with schema and messages
 * @param {string} path - Current field path for nested validation
 * @param {Object} validationContext - Compilation context with options and rule cache
 * @returns {ObjectValidationResult} Generated validation code
 * @example
 * // Example usage in validator compilation
 * const result = checkObject({
 *   schema: {
 *     type: 'object',
 *     strict: true,
 *     properties: {
 *       name: { type: 'string' },
 *       age: { type: 'number', min: 0 }
 *     }
 *   },
 *   messages: { object: 'Must be an object', objectStrict: 'Extra properties not allowed' }
 * }, 'user', context);
 * console.log(result.code); // Generated validation function code
 */
module.exports = function checkObject ({ schema, messages }, path, context) {
  const code = [];

  // check for type
  code.push(`
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      ${this.makeErrorCode({ type: 'object', passed: 'value', messages })}
      return value;
    }
  `);

  const subSchema = schema.properties || schema.props;

  // handle sub schemas
  if (subSchema) {
    code.push('let parentObject = value');
    code.push('let parentField = field');

    const keys = Object.keys(subSchema);
    for (let i = 0; i < keys.length; i++) {
      const property = keys[i];
      const name = escapeEvalString(property);
      const safeSubName = identifierRegex.test(name) ? `.${name}` : `["${name}"]`;
      const safePropName = `parentObject${safeSubName}`;
      const newPath = (path ? path + '.' : '') + property;

      code.push(`\n// Field: ${escapeEvalString(newPath)}`);
      code.push(`field = parentField ? parentField + '${safeSubName}' : '${name}';`);
      code.push(`value = ${safePropName};`);

      const rule = this.getRuleFromSchema(subSchema[property]);
      code.push(this.compileRule(rule, context, newPath, `${safePropName} = context.func[##INDEX##](value, field, parentObject, errors, context)`, safePropName));
    }

    if (schema.strict) {
      const allowedProperties = Object.keys(subSchema);

      code.push(`
        field = parentField || '$root'
        const invalidProperties = [];
        const props = Object.keys(parentObject);
        for (let i = 0; i < props.length; i++) {
          if (!${JSON.stringify(allowedProperties)}.includes(props[i])) {
            invalidProperties.push(props[i]);
          }
        }

        if (invalidProperties.length > 0) {
      `);

      if (context.options.strictMode === 'remove') {
        code.push(`
          invalidProperties.forEach((propertyName) => {
            delete parentObject[propertyName]
          })
        `);
      } else {
        code.push(`
          ${this.makeErrorCode({ type: 'objectStrict', expected: `"${allowedProperties.join(', ')}"`, passed: 'invalidProperties.join(", ")', messages })}
        `);
      }
      code.push('}');
    }

    code.push(`
      return parentObject
    `);
  } else {
    code.push(`
        return value
    `);
  }

  return {
    code: code.join('\n')
  };
};
