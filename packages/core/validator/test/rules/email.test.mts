import { describe, it } from "node:test";
import assert from "node:assert/strict";
import ModelValidator from "../../lib/validator.mts";

describe("Email validator", () => {
  it("email validator (valid)", () => {
    const schema = {
      email: { type: "email" },
    };

    const parameters = { email: "hello@weave-js.com" };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
    assert.equal(parameters.email, "hello@weave-js.com");
  });

  it("email validator - invalid, not an email", () => {
    const schema = {
      email: { type: "email" },
    };

    const parameters = { email: "@weave-js.com" };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.ok(Array.isArray(result));
    assert.equal(result[0].message, 'The value of parameter "email" is not a valid email address.');
  });

  it("email validator - invalid, not a string", () => {
    const schema = {
      email: { type: "email" },
    };

    const parameters = { email: new Date() };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.ok(Array.isArray(result));
    assert.equal(result[0].message, 'The parameter "email" have to be a string.');
  });

  it("should use precise mode", () => {
    const schema = {
      email: { type: "email", mode: "precise" },
    };

    const parameters = { email: new Date() };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.ok(Array.isArray(result));
    assert.equal(result[0].message, 'The parameter "email" have to be a string.');
  });

  it("should normalize email", () => {
    const schema = {
      email: { type: "email", normalize: true },
    };

    const parameters = { email: "KevIn.RieS@fAcHWerK.Io" };
    const validator = ModelValidator();
    const validate = validator.compile(schema);
    const result = validate(parameters);

    assert.equal(result, true);
    assert.equal(parameters.email, "kevin.ries@fachwerk.io");
  });
});
