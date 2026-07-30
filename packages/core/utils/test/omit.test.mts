import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { omit } from "../lib/omit.mts";

describe("Omit", () => {
  it("should omit properties from object", () => {
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

    assert.strictEqual(omit(null as unknown as object, []), null);
    assert.deepStrictEqual(omit(source, ["settings"]), {
      name: "test",
    });
  });
});
