import { describe, it } from "node:test";
import assert from "node:assert/strict";
import ModelValidator from "../../lib/validator.mts";

describe('Type "multi" test', () => {
  it("should throw an error if ther is passed an empty array", () => {
    const schema = {
      id: [],
    };
    const validator = ModelValidator();
    assert.throws(() => {
      validator.compile(schema);
    }, new Error("Invalid schema."));
  });

  it("should call custom validator", () => {
    const validator = ModelValidator();
    const schema = {
      id: [{ type: "string" }, { type: "array" }],
    };
    const validate = validator.compile(schema);

    const validParams1 = { id: ["kevin ries"] };
    const validParams2 = { id: "kevin ries" };
    const invalidParams = { id: 222 };

    const result1 = validate(validParams1);
    const result2 = validate(validParams2);
    const result3 = validate(invalidParams);

    assert.equal(result1, true);
    assert.equal(result2, true);
    assert.equal(
      JSON.stringify(result3),
      '[{"type":"string","message":"The parameter \\"id\\" have to be a string.","field":"id","passed":222},{"type":"array","message":"The parameter \\"id\\" have to be an array.","field":"id"}]',
    );
  });
});
