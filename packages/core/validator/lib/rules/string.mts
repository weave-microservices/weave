/**
 * @fileoverview String validation rule generator for Weave validator
 * Generates optimized validation code for string type schemas
 * @author Kevin Ries <kevin.ries@fachwerk.io>
 * @version 0.14.0
 */

/**
 * Regular expression pattern for validating Base64 encoded strings
 */
const BASE64_PATTERN = /^(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/**
 * Regular expression pattern for validating UUID v1-v5 format
 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Regular expression pattern for validating international phone numbers (E.164 format)
 */
const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;

/**
 * Regular expression pattern for validating hexadecimal strings
 */
const HEX_PATTERN = /^[0-9a-fA-F]+$/;

export default function checkString(this: any, { schema, messages }: any) {
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
}
