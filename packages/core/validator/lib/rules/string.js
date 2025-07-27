/**
 * @fileoverview String validation rule generator for Weave validator
 * Generates optimized validation code for string type schemas
 * @author Kevin Ries <kevin.ries@fachwerk.io>
 * @version 0.14.0
 */

/**
 * Regular expression pattern for validating Base64 encoded strings
 * @type {RegExp}
 * @constant
 */
const BASE64_PATTERN = /^(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/**
 * Regular expression pattern for validating UUID v1-v5 format
 * @type {RegExp}
 * @constant
 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Regular expression pattern for validating international phone numbers (E.164 format)
 * @type {RegExp}
 * @constant
 */
const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;

/**
 * Regular expression pattern for validating hexadecimal strings
 * @type {RegExp}
 * @constant
 */
const HEX_PATTERN = /^[0-9a-fA-F]+$/;

/**
 * String validation rule generator function
 * @typedef {Object} StringValidationContext
 * @property {Object} schema - String schema configuration
 * @property {number} [schema.minLength] - Minimum string length
 * @property {number} [schema.maxLength] - Maximum string length
 * @property {string} [schema.equal] - Exact string value required
 * @property {boolean} [schema.trim] - Trim whitespace from both ends
 * @property {boolean} [schema.trimLeft] - Trim whitespace from start (deprecated, use trimStart)
 * @property {boolean} [schema.trimRight] - Trim whitespace from end (deprecated, use trimEnd)
 * @property {boolean} [schema.uppercase] - Convert to uppercase
 * @property {boolean} [schema.lowercase] - Convert to lowercase
 * @property {boolean} [schema.base64] - Validate as base64 string
 * @property {boolean} [schema.uuid] - Validate as UUID format
 * @property {boolean} [schema.phone] - Validate as phone number
 * @property {boolean} [schema.hex] - Validate as hexadecimal string
 * @property {RegExp|string} [schema.pattern] - Custom regex pattern to match
 * @property {Object} messages - Error message templates
 *
 * @typedef {Object} StringValidationResult
 * @property {boolean} isSanitized - Whether the validation includes value transformation
 * @property {string} code - Generated JavaScript validation code
 *
 * @param {StringValidationContext} context - Validation context with schema and messages
 * @returns {StringValidationResult} Generated validation code and metadata
 * @example
 * // Example usage in validator compilation
 * const result = checkString({
 *   schema: { type: 'string', minLength: 3, trim: true, pattern: /^[a-z]+$/ },
 *   messages: { string: 'Must be a string', stringMinLength: 'Too short' }
 * });
 * console.log(result.code); // Generated validation function code
 * console.log(result.isSanitized); // true (because of trim)
 */
module.exports = function checkString ({ schema, messages }) {
  const code = [];
  let isSanitized = false;
  code.push(`
    if (typeof value !== 'string') {
      ${this.makeErrorCode({ type: 'string', passed: 'value', messages })}
      return value
    }

    const length = value.length
  `);

  // trim value
  if (schema.trim) {
    isSanitized = true;
    code.push(`
			value = value.trim();
		`);
  }

  if (schema.trimLeft) {
    isSanitized = true;
    code.push(`
			value = value.trimStart();
		`);
  }

  if (schema.trimRight) {
    isSanitized = true;
    code.push(`
			value = value.trimEnd();
		`);
  }

  if (schema.uppercase) {
    isSanitized = true;
    code.push(`
			value = value.toUpperCase();
		`);
  }

  if (schema.lowercase) {
    isSanitized = true;
    code.push(`
			value = value.toLowerCase();
		`);
  }

  if (schema.minLength) {
    code.push(`
      if (length < ${schema.minLength}) {
        ${this.makeErrorCode({ type: 'stringMinLength', passed: 'value', expected: schema.minLength, messages })}
        return value
      }
    `);
  }

  if (schema.maxLength) {
    code.push(`
      if (length > ${schema.maxLength}) {
        ${this.makeErrorCode({ type: 'stringMaxLength', passed: 'value', expected: `"${schema.maxLength}"`, messages })}
        return value
      }
    `);
  }

  if (schema.equal) {
    code.push(`
      if (value !== '${schema.equal}') {
        ${this.makeErrorCode({ type: 'stringEqual', passed: 'value', expected: `"${schema.equal}"`, messages })}
        return value
      }
    `);
  }

  if (schema.base64) {
    code.push(`
      if(!${BASE64_PATTERN.toString()}.test(value)) {
        ${this.makeErrorCode({ type: 'stringBase64', passed: 'value', messages })}
        return value
      }
    `);
  }

  if (schema.uuid) {
    code.push(`
      if(!${UUID_PATTERN.toString()}.test(value)) {
        ${this.makeErrorCode({ type: 'stringUuid', passed: 'value', messages })}
        return value
      }
    `);
  }

  if (schema.phone) {
    code.push(`
      if(!${PHONE_PATTERN.toString()}.test(value)) {
        ${this.makeErrorCode({ type: 'stringPhone', passed: 'value', messages })}
        return value
      }
    `);
  }

  if (schema.hex) {
    code.push(`
      if(!${HEX_PATTERN.toString()}.test(value)) {
        ${this.makeErrorCode({ type: 'stringHex', passed: 'value', messages })}
        return value
      }
    `);
  }

  if (schema.pattern) {
    const pattern = schema.pattern instanceof RegExp ? schema.pattern : new RegExp(schema.pattern);
    code.push(`
      if(!${pattern.toString()}.test(value)) {
        ${this.makeErrorCode({ type: 'stringPattern', passed: 'value', expected: `"${pattern.source}"`, messages })}
        return value
      }
    `);
  }

  code.push(`
    return value
  `);

  return {
    isSanitized,
    code: code.join('\n')
  };
};
