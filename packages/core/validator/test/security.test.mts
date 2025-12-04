/**
 * @fileoverview Security tests for code injection vulnerabilities
 * @author Kevin Ries <kevin.ries@fachwerk.io>
 * @version 0.14.0
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import ModelValidatorFactory from "../lib/validator.mts";

describe("Security - Code Injection Prevention", () => {
  const validator = ModelValidatorFactory();

  describe("String equal injection attempts", () => {
    it("should prevent code injection via single quote escape", () => {
      const maliciousSchema = {
        type: "string",
        equal: "'; console.log('HACKED'); return true; //'",
      };

      const check = validator.compile(maliciousSchema, { root: true });

      // Should validate normally without executing injected code
      const result1 = check("'; console.log('HACKED'); return true; //'");
      assert.strictEqual(result1, true, "Should accept exact match");

      const result2 = check("normal string");
      assert.notStrictEqual(result2, true, "Should reject non-matching string");
      assert.ok(Array.isArray(result2), "Should return error array");
    });

    it("should prevent code injection via newline characters", () => {
      const maliciousSchema = {
        type: "string",
        equal: "test\nconsole.log('HACKED')",
      };

      const check = validator.compile(maliciousSchema, { root: true });

      const result = check("test\nconsole.log('HACKED')");
      assert.strictEqual(result, true, "Should handle newlines safely");
    });

    it("should prevent code injection via backslash escape", () => {
      const maliciousSchema = {
        type: "string",
        equal: "test\\'; console.log('HACKED'); //'",
      };

      const check = validator.compile(maliciousSchema, { root: true });

      const result = check("test\\'; console.log('HACKED'); //'");
      assert.strictEqual(result, true, "Should handle backslashes safely");
    });

    it("should prevent code injection via unicode line terminators", () => {
      const maliciousSchema = {
        type: "string",
        equal: "test\u2028console.log('HACKED')",
      };

      const check = validator.compile(maliciousSchema, { root: true });

      const result = check("test\u2028console.log('HACKED')");
      assert.strictEqual(result, true, "Should handle unicode line terminators safely");
    });
  });

  describe("RegEx pattern injection attempts", () => {
    it("should prevent code injection via pattern source", () => {
      const maliciousSchema = {
        type: "string",
        pattern: /test.*HACKED/,
      };

      const check = validator.compile(maliciousSchema, { root: true });

      // Should validate normally without executing injected code
      const result1 = check("test'; console.log('HACKED'); //");
      assert.strictEqual(result1, true, "Should match pattern safely");

      const result2 = check("other string");
      assert.notStrictEqual(result2, true, "Should reject non-matching string");
      assert.ok(Array.isArray(result2), "Should return error array");
    });

    it("should prevent code injection via string pattern", () => {
      const maliciousSchema = {
        type: "string",
        pattern: "test.*HACKED",
      };

      const check = validator.compile(maliciousSchema, { root: true });

      const result = check("test'; console.log('HACKED'); //");
      assert.strictEqual(result, true, "Should handle pattern string safely");
    });

    it("should handle complex regex patterns safely", () => {
      const maliciousSchema = {
        type: "string",
        pattern: /^[a-z]+\n.*$/,
      };

      const check = validator.compile(maliciousSchema, { root: true });

      const result = check("test\nvalue");
      assert.strictEqual(result, true, "Should handle newlines in regex safely");
    });
  });

  describe("Object property name injection attempts", () => {
    it("should prevent code injection via property names with quotes", () => {
      const maliciousSchema = {
        "test'; console.log('HACKED'); //": "string",
      };

      const check = validator.compile(maliciousSchema);

      const result = check({
        "test'; console.log('HACKED'); //": "value",
      });
      assert.strictEqual(result, true, "Should handle malicious property names safely");
    });

    it("should prevent code injection via property names with newlines", () => {
      const maliciousSchema = {
        "test\nconsole.log('HACKED')": "string",
      };

      const check = validator.compile(maliciousSchema);

      const result = check({
        "test\nconsole.log('HACKED')": "value",
      });
      assert.strictEqual(result, true, "Should handle newlines in property names safely");
    });

    it("should prevent code injection via nested property names", () => {
      const maliciousSchema = {
        user: {
          type: "object",
          properties: {
            "name'; console.log('HACKED'); //": "string",
          },
        },
      };

      const check = validator.compile(maliciousSchema);

      const result = check({
        user: {
          "name'; console.log('HACKED'); //": "John",
        },
      });
      assert.strictEqual(result, true, "Should handle nested malicious property names safely");
    });
  });

  describe("Combined injection attempts", () => {
    it("should prevent multiple injection vectors in one schema", () => {
      const maliciousSchema = {
        "prop'; console.log('HACK1'); //": {
          type: "string",
          equal: "'; console.log('HACK2'); //",
          pattern: /'; console.log('HACK3'); \/\//,
        },
      };

      const check = validator.compile(maliciousSchema);

      const result = check({
        "prop'; console.log('HACK1'); //": "'; console.log('HACK2'); //",
      });

      // Should validate without executing any injected code
      assert.notStrictEqual(result, true, "Should reject due to pattern mismatch");
      assert.ok(Array.isArray(result), "Should return error array");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty strings safely", () => {
      const schema = {
        type: "string",
        equal: "",
      };

      const check = validator.compile(schema, { root: true });
      const result = check("");
      assert.strictEqual(result, true, "Should handle empty strings");
    });

    it("should handle strings with only special characters", () => {
      const schema = {
        type: "string",
        equal: "test'value",
      };

      const check = validator.compile(schema, { root: true });
      const result = check("test'value");
      assert.strictEqual(result, true, "Should handle special characters");
    });

    it("should handle very long strings safely", () => {
      const longString = "a".repeat(10000) + "'; console.log('HACKED'); //";
      const schema = {
        type: "string",
        equal: longString,
      };

      const check = validator.compile(schema, { root: true });
      const result = check(longString);
      assert.strictEqual(result, true, "Should handle long strings safely");
    });
  });
});
