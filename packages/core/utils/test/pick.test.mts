import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pick } from "../lib/pick.mts";
import { dotGet } from "../lib/dot-get.mts";

describe("Pick test", () => {
  it("should pick properties from object", () => {
    const source = {
      name: "test",
      settings: {
        a: 100,
        endpoints: {
          http: true,
          tcp: false,
          ws: [1, 2, 3],
        },
        connections: [
          {
            host: "test.de",
            ip: "127.0.0.1",
          },
          {
            host: "google.com",
            ip: "127.0.0.1",
          },
        ],
      },
    };

    const result = pick(source, ["settings"]);
    assert.ok(result.settings);
    assert.deepStrictEqual(result.settings, dotGet(source, "settings"));

    const result2 = pick(source, ["settings.endpoints"]);
    assert.ok(result2.settings);
    assert.ok(result2.settings.endpoints);
    assert.deepStrictEqual(result2.settings.endpoints, dotGet(source, "settings.endpoints"));
  });
});
