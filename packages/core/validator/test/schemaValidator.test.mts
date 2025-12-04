import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateSchema, validateOptions } from "../lib/schemaValidator.mts";

describe("Schema Validator", () => {
  describe("validateSchema", () => {
    describe("basic schema types", () => {
      it("should validate string shorthand", () => {
        const errors = validateSchema("string");
        assert.deepEqual(errors, []);
      });

      it("should reject invalid string shorthand", () => {
        const errors = validateSchema("invalid" as any);
        assert.equal(errors.length, 1);
        assert.ok(errors[0].message.includes('Invalid type "invalid"'));
        assert.equal(errors[0].path, "");
      });

      it("should validate all valid type shorthands", () => {
        const validTypes = [
          "any",
          "array",
          "boolean",
          "date",
          "email",
          "enum",
          "forbidden",
          "multi",
          "number",
          "object",
          "string",
          "url",
        ];
        validTypes.forEach((type) => {
          const errors = validateSchema(type as any);
          assert.deepEqual(errors, []);
        });
      });
    });

    describe("array schemas", () => {
      it("should validate array shorthand", () => {
        const errors = validateSchema([{ type: "string" }, { type: "number" }]);
        assert.deepEqual(errors, []);
      });

      it("should reject empty array", () => {
        const errors = validateSchema([]);
        assert.equal(errors.length, 1);
        assert.ok(errors[0].message.includes("Multi-type schema array cannot be empty"));
        assert.equal(errors[0].path, "");
      });

      it("should validate nested array schemas", () => {
        const errors = validateSchema([
          { type: "string", minLength: 1 },
          { type: "number", min: 0 },
          [{ type: "boolean" }, { type: "date" }],
        ]);
        assert.deepEqual(errors, []);
      });

      it("should report errors in array items with correct paths", () => {
        const errors = validateSchema([
          { type: "invalid" } as any,
          { type: "string", minLength: -1 },
        ]);
        assert.ok(errors.length > 0);
        assert.ok(errors.some((e) => e.path === "[0].type"));
        assert.ok(errors.some((e) => e.path === "[1].minLength"));
      });
    });

    describe("invalid schemas", () => {
      it("should reject null schema", () => {
        const errors = validateSchema(null as any);
        assert.equal(errors.length, 1);
        assert.ok(errors[0].message.includes("Schema must be an object, string, or array"));
      });

      it("should reject undefined schema", () => {
        const errors = validateSchema(undefined as any);
        assert.equal(errors.length, 1);
        assert.ok(errors[0].message.includes("Schema must be an object, string, or array"));
      });

      it("should reject number schema", () => {
        const errors = validateSchema(123 as any);
        assert.equal(errors.length, 1);
        assert.ok(errors[0].message.includes("Schema must be an object, string, or array"));
      });

      it("should reject schema without type", () => {
        const errors = validateSchema({} as any);
        assert.equal(errors.length, 1);
        assert.ok(errors[0].message.includes('Schema must have a "type" property'));
        assert.equal(errors[0].path, ".type");
      });

      it("should reject schema with invalid type", () => {
        const errors = validateSchema({ type: "invalidType" } as any);
        assert.equal(errors.length, 1);
        assert.ok(errors[0].message.includes('Invalid type "invalidType"'));
        assert.equal(errors[0].path, ".type");
      });
    });

    describe("common properties", () => {
      it("should validate optional property", () => {
        const errors = validateSchema({ type: "string", optional: true });
        assert.deepEqual(errors, []);
      });

      it("should reject invalid optional property", () => {
        const errors = validateSchema({ type: "string", optional: "yes" as any });
        assert.equal(errors.length, 1);
        assert.ok(errors[0].message.includes("Optional must be a boolean"));
      });

      it("should validate nullable property", () => {
        const errors = validateSchema({ type: "string", nullable: true });
        assert.deepEqual(errors, []);
      });

      it("should reject invalid nullable property", () => {
        const errors = validateSchema({ type: "string", nullable: "yes" as any });
        assert.equal(errors.length, 1);
        assert.ok(errors[0].message.includes("Nullable must be a boolean"));
      });

      it("should validate messages property", () => {
        const errors = validateSchema({ type: "string", messages: { string: "Custom message" } });
        assert.deepEqual(errors, []);
      });

      it("should reject invalid messages property", () => {
        const errors = validateSchema({ type: "string", messages: "invalid" as any });
        assert.equal(errors.length, 1);
        assert.ok(errors[0].message.includes("Messages must be an object"));
      });
    });
  });

  describe("validateOptions", () => {
    it("should validate valid options", () => {
      const errors = validateOptions({ strict: true, strictMode: "remove", root: false });
      assert.deepEqual(errors, []);
    });

    it("should reject non-object options", () => {
      const errors = validateOptions("invalid");
      assert.equal(errors.length, 1);
      assert.ok(errors[0].message.includes("Options must be an object"));
    });

    it("should reject invalid strict property", () => {
      const errors = validateOptions({ strict: "yes" });
      assert.equal(errors.length, 1);
      assert.ok(errors[0].message.includes("strict must be a boolean"));
    });

    it("should reject invalid strictMode property", () => {
      const errors = validateOptions({ strictMode: "invalid" });
      assert.equal(errors.length, 1);
      assert.ok(errors[0].message.includes("strictMode must be one of"));
    });

    it("should reject invalid root property", () => {
      const errors = validateOptions({ root: "yes" });
      assert.equal(errors.length, 1);
      assert.ok(errors[0].message.includes("root must be a boolean"));
    });
  });
});
