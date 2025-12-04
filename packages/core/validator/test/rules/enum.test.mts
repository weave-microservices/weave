import { describe, it } from "node:test";
import assert from "node:assert/strict";
import ModelValidator from "../../lib/validator.mts";

describe("Enum validator", () => {
  it("any value", () => {
    const schema = {
      type: { type: "enum", values: ["aaa", "bbb", "ccc"] },
    };

    const parameters = { type: "aaa" };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
  });

  it("shoud validate undefined values", () => {
    const schema = {
      type: { type: "enum" },
    };

    const parameters = { type: "ddd" };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.ok(Array.isArray(result));
    assert.equal(
      result[0].message,
      'The  value of the parameter "type" with the value "ddd" does not match with any of the allowed values.',
    );
  });
});
