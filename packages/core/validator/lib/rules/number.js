/**
 * @fileoverview Number validation rule generator for Weave validator
 * Generates optimized validation code for number type schemas
 * @author Kevin Ries <kevin.ries@fachwerk.io>
 * @version 0.14.0
 */

/**
 * Number validation rule generator function
 * @typedef {Object} NumberValidationContext
 * @property {Object} schema - Number schema configuration
 * @property {boolean} [schema.convert] - Convert value to number before validation
 * @property {number} [schema.min] - Minimum numeric value
 * @property {number} [schema.max] - Maximum numeric value
 * @property {number} [schema.equal] - Exact numeric value required
 * @property {number} [schema.notEqual] - Value that is not allowed
 * @property {boolean} [schema.integer] - Must be an integer
 * @property {boolean} [schema.positive] - Must be positive (> 0)
 * @property {boolean} [schema.negative] - Must be negative (< 0)
 * @property {Object} messages - Error message templates
 *
 * @typedef {Object} NumberValidationResult
 * @property {boolean} sanitized - Whether the validation includes value transformation
 * @property {string} code - Generated JavaScript validation code
 *
 * @param {NumberValidationContext} context - Validation context with schema and messages
 * @returns {NumberValidationResult} Generated validation code and metadata
 * @example
 * // Example usage in validator compilation
 * const result = checkNumber({
 *   schema: { type: 'number', min: 0, max: 100, integer: true },
 *   messages: { number: 'Must be a number', numberMin: 'Too small' }
 * });
 * console.log(result.code); // Generated validation function code
 * console.log(result.sanitized); // false (no conversion)
 */
module.exports = function checkNumber ({ schema, messages }) {
  const code = [];
  let sanitized = false;

  if (schema.convert) {
    sanitized = true;

    code.push(`
      if (typeof value !== 'number') {
        value = Number(value)
      }
    `);
  }

  code.push(`
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      ${this.makeErrorCode({ type: 'number', passed: 'value', messages })}
    }
  `);

  if (schema.min) {
    code.push(`
      if (value < ${schema.min}) {
        ${this.makeErrorCode({ type: 'numberMin', passed: 'value', expected: schema.min, messages })}
      }
    `);
  }

  if (schema.max) {
    code.push(`
      if (value > ${schema.max}) {
        ${this.makeErrorCode({ type: 'numberMax', passed: 'value', expected: schema.max, messages })}
      }
    `);
  }

  if (schema.equal) {
    code.push(`
      if (value !== ${schema.equal}) {
        ${this.makeErrorCode({ type: 'numberEqual', passed: 'value', expected: schema.equal, messages })}
      }
    `);
  }

  if (schema.notEqual) {
    code.push(`
      if (value === ${schema.notEqual}) {
        ${this.makeErrorCode({ type: 'numberNotEqual', passed: 'value', expected: schema.notEqual, messages })}
      }
    `);
  }

  if (schema.integer) {
    code.push(`
      if (value % 1 !== 0) {
        ${this.makeErrorCode({ type: 'numberInteger', passed: 'value', messages })}
      }
    `);
  }

  if (schema.positive) {
    code.push(`
      if (value <= 0) {
        ${this.makeErrorCode({ type: 'numberPositive', passed: 'value', messages })}
      }
    `);
  }

  if (schema.negative) {
    code.push(`
      if (value >= 0) {
        ${this.makeErrorCode({ type: 'numberNegative', passed: 'value', messages })}
      }
    `);
  }

  code.push(`
    return value
  `);

  return {
    sanitized,
    code: code.join('\n')
  };
};
