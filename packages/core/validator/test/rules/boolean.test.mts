import { describe, it } from "node:test";
import assert from "node:assert/strict";
import ModelValidator from "../../lib/validator.mts";

describe("Boolean validator", () => {
  it("boolean validator (valid)", () => {
    const schema = {
      isActive: { type: "boolean" },
    };

    const parameters = { isActive: true };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
  });

  it("boolean validator convert true (valid)", () => {
    const schema = {
      isActive: { type: "boolean", convert: true },
    };

    const parameters = { isActive: "true" };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
  });

  it("boolean validator convert false (valid)", () => {
    const schema = {
      isActive: { type: "boolean", convert: true },
    };

    const parameters = { isActive: "false" };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
  });

  it("boolean validator convert true (valid)", () => {
    const schema = {
      isActive: { type: "boolean", convert: true },
    };

    const parameters = { isActive: "true" };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
  });

  it("boolean validator convert false (valid)", () => {
    const schema = {
      isActive: { type: "boolean", convert: true },
    };

    const parameters = { isActive: "false" };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
  });

  it("boolean validator convert 1 (valid)", () => {
    const schema = {
      isActive: { type: "boolean", convert: true },
    };

    const parameters = { isActive: 1 };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
    assert.equal(parameters.isActive, true);
  });

  it("boolean validator convert 0 (valid)", () => {
    const schema = {
      isActive: { type: "boolean", convert: true },
    };

    const parameters = { isActive: 0 };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
    assert.equal(parameters.isActive, false);
  });

  it("boolean validator convert 1 (invalid)", () => {
    const schema = {
      isActive: { type: "boolean", convert: true },
    };

    const parameters = { isActive: "1" };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.ok(Array.isArray(result));
    assert.equal(result[0].message, 'The parameter "isActive" have to be a boolean value.');
  });
});
