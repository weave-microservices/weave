const ModelValidator = require('../../lib/validator');

describe('String Pattern Validations', () => {
  let validator;

  beforeEach(() => {
    validator = ModelValidator();
  });

  describe('UUID validation', () => {
    it('should validate valid UUIDs', () => {
      const schema = { id: { type: 'string', uuid: true }};
      const validate = validator.compile(schema);

      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '550e8400-e29b-41d4-a716-446655440000'
      ];

      validUUIDs.forEach(uuid => {
        const result = validate({ id: uuid });
        expect(result).toBe(true);
      });
    });

    it('should reject invalid UUIDs', () => {
      const schema = { id: { type: 'string', uuid: true }};
      const validate = validator.compile(schema);

      const invalidUUIDs = [
        'not-a-uuid',
        '123e4567-e89b-12d3-a456',
        '123e4567-e89b-12d3-a456-42661417400g',
        ''
      ];

      invalidUUIDs.forEach(uuid => {
        const result = validate({ id: uuid });
        expect(Array.isArray(result)).toBe(true);
        expect(result[0].type).toBe('stringUuid');
      });
    });
  });

  describe('Phone validation', () => {
    it('should validate valid phone numbers', () => {
      const schema = { phone: { type: 'string', phone: true }};
      const validate = validator.compile(schema);

      const validPhones = [
        '+1234567890',
        '+49301234567',
        '1234567890',
        '+12345678901234'
      ];

      validPhones.forEach(phone => {
        const result = validate({ phone });
        expect(result).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const schema = { phone: { type: 'string', phone: true }};
      const validate = validator.compile(schema);

      const invalidPhones = [
        '+0123456789', // starts with 0
        'abc123',
        '',
        '+123456789012345678' // too long
      ];

      invalidPhones.forEach(phone => {
        const result = validate({ phone });
        expect(Array.isArray(result)).toBe(true);
        expect(result[0].type).toBe('stringPhone');
      });
    });
  });

  describe('Hex validation', () => {
    it('should validate valid hex strings', () => {
      const schema = { hex: { type: 'string', hex: true }};
      const validate = validator.compile(schema);

      const validHex = [
        'abcdef',
        'ABCDEF',
        '123456',
        '0123456789abcdefABCDEF'
      ];

      validHex.forEach(hex => {
        const result = validate({ hex });
        expect(result).toBe(true);
      });
    });

    it('should reject invalid hex strings', () => {
      const schema = { hex: { type: 'string', hex: true }};
      const validate = validator.compile(schema);

      const invalidHex = [
        'xyz',
        'abcdefg',
        '',
        '123 456'
      ];

      invalidHex.forEach(hex => {
        const result = validate({ hex });
        expect(Array.isArray(result)).toBe(true);
        expect(result[0].type).toBe('stringHex');
      });
    });
  });

  describe('Pattern validation', () => {
    it('should validate with RegExp pattern', () => {
      const schema = {
        password: {
          type: 'string',
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
        }
      };
      const validate = validator.compile(schema);

      const result = validate({ password: 'Password123' });
      expect(result).toBe(true);
    });

    it('should validate with string pattern', () => {
      const schema = {
        code: {
          type: 'string',
          pattern: '^[A-Z]{3}[0-9]{3}$'
        }
      };
      const validate = validator.compile(schema);

      const result = validate({ code: 'ABC123' });
      expect(result).toBe(true);
    });

    it('should reject invalid patterns', () => {
      const schema = {
        code: {
          type: 'string',
          pattern: '^[A-Z]{3}[0-9]{3}$'
        }
      };
      const validate = validator.compile(schema);

      const result = validate({ code: 'abc123' });
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].type).toBe('stringPattern');
    });
  });

  describe('Base64 validation', () => {
    it('should validate valid base64 strings', () => {
      const schema = { data: { type: 'string', base64: true }};
      const validate = validator.compile(schema);

      const validBase64 = [
        'SGVsbG8gV29ybGQ=',
        'VGVzdA==',
        'YWJjZGVmZ2hpams='
      ];

      validBase64.forEach(b64 => {
        const result = validate({ data: b64 });
        expect(result).toBe(true);
      });
    });

    it('should reject invalid base64 strings', () => {
      const schema = { data: { type: 'string', base64: true }};
      const validate = validator.compile(schema);

      const invalidBase64 = [
        'Invalid base64!',
        'SGVsbG8gV29ybGQ!' // invalid character
      ];

      invalidBase64.forEach(b64 => {
        const result = validate({ data: b64 });
        expect(Array.isArray(result)).toBe(true);
        expect(result[0].type).toBe('stringBase64');
      });
    });
  });
});
