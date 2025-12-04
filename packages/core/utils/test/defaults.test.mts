import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { defaultsDeep } from "../lib/defaults.mts";

describe("DefaultsDeep function", () => {
  it("should return source when no defaults", () => {
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

    assert.deepStrictEqual(defaultsDeep(source), source);
  });

  it("should merge empty target with source", () => {
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

    assert.deepStrictEqual(defaultsDeep({}, source), source);
  });

  it("should get defaults with an undefined target", () => {
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

    assert.deepStrictEqual(defaultsDeep(undefined, source), source);
  });

  it("should not merge undefined props", () => {
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

    assert.deepStrictEqual(defaultsDeep(source, undefined), source);
  });

  it("should merge target with defaults", () => {
    const source = {
      name: "test",
      load: true,
      adapter: undefined,
      settings: {
        a: 100,
        b: 400,
        test: {
          a: "",
          b: 1,
          c: undefined,
        },
        endpoints: {
          http: true,
          tcp: false,
          ws: [1, 2, 3],
        },
      },
    };

    const target = {
      name: "test2",
      load: false,
      settings: {
        a: 200,
        endpoints: {
          https: true,
          http: false,
          tcp: false,
          ws: [1, 2, 3],
        },
      },
    };

    const merged = defaultsDeep(target, source);

    // Note: defaultsDeep preserves undefined values from source
    assert.deepStrictEqual(merged, {
      name: "test2",
      load: false,
      adapter: undefined,
      settings: {
        a: 200,
        b: 400,
        test: {
          a: "",
          b: 1,
          c: undefined,
        },
        endpoints: {
          https: true,
          http: false,
          tcp: false,
          ws: [1, 2, 3],
        },
      },
    });
  });
});
