import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dotSet } from "../lib/dot-set.mts";

describe("Set properties by dot separated path", () => {
  it("should modify a property", () => {
    const source = {
      name: "test",
      settings: {
        a: 100,
        endpoints: {
          http: true,
          tcp: false,
          ws: [1, 2, 3],
        },
      },
    };
    dotSet(source, "settings.a", [1, 2, 3]);
    assert.deepStrictEqual(source.settings.a, [1, 2, 3]);
  });

  it("should create a new property", () => {
    const source = {
      name: "test",
      settings: {
        a: 100,
        endpoints: {
          http: true,
          tcp: false,
          ws: [1, 2, 3],
        },
      },
    };

    const meta = { hostname: "held" };
    dotSet(source, "settings.meta", meta);
    assert.deepStrictEqual((source.settings as any).meta, meta);
  });

  it("should not override an existing property on the path that is not an object", () => {
    const source = {
      name: "test",
      settings: {
        a: 100,
        endpoints: {
          http: true,
          tcp: false,
          ws: [1, 2, 3],
        },
      },
    };

    const meta = { hostname: "held" };

    assert.throws(
      () => {
        dotSet(source, "settings.a.b.c", meta);
      },
      {
        message: 'The property "a" already exists and is not an object.',
      },
    );
  });
});
