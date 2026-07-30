import { describe, it } from "node:test";
import assert from "node:assert/strict";
import ModelValidator from "../lib/validator.mts";

describe("Validator", () => {
  it("should create validator instance", () => {
    const validator = ModelValidator();
    assert.ok(validator);
    assert.equal(typeof validator.compile, "function");
    assert.equal(typeof validator.validate, "function");
    assert.equal(typeof validator.addRule, "function");
  });

  it("should compile and validate simple schema", () => {
    const validator = ModelValidator();
    const schema = {
      name: { type: "string" },
    };

    const validate = validator.compile(schema);
    const result = validate({ name: "test" });

    assert.equal(result, true);
  });

  it("should validate with validate method", () => {
    const validator = ModelValidator();
    const schema = {
      name: { type: "string" },
    };

    const result = validator.validate({ name: "test" }, schema);

    assert.equal(result, true);
  });

  it("should return errors for invalid data", () => {
    const validator = ModelValidator();
    const schema = {
      name: { type: "string" },
    };

    const result = validator.validate({ name: 123 }, schema);

    assert.ok(Array.isArray(result));
    assert.ok(result.length > 0);
    assert.equal(result[0].type, "string");
  });

  it("should support optional fields", () => {
    const validator = ModelValidator();
    const schema = {
      name: { type: "string", optional: true },
    };

    const result = validator.validate({}, schema);

    assert.equal(result, true);
  });

  it("should support nullable fields", () => {
    const validator = ModelValidator();
    const schema = {
      name: { type: "string", nullable: true },
    };

    const result = validator.validate({ name: null }, schema);

    assert.equal(result, true);
  });

  it("should support default values", () => {
    const validator = ModelValidator();
    const schema = {
      name: { type: "string", default: "default" },
    };

    const data: Record<string, unknown> = {};
    const validate = validator.compile(schema);
    validate(data);

    assert.equal(data.name, "default");
  });

  it("should support custom error messages", () => {
    const validator = ModelValidator();
    const schema = {
      name: {
        type: "string",
        messages: {
          string: "Custom error message",
        },
      },
    };

    const result = validator.validate({ name: 123 }, schema);

    assert.ok(Array.isArray(result));
    assert.equal(result[0].message, "Custom error message");
  });
});
