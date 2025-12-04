import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dotGet } from "../lib/dot-get.mts";

describe("Get properties by dot separated path", () => {
  it("should return a property", () => {
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

    dotGet(source, "settings.endpoints.http");
    assert.strictEqual(dotGet(source, "name"), "test");
    assert.strictEqual(dotGet(source, "settings.a"), 100);
    assert.deepStrictEqual(dotGet(source, "settings.endpoints"), {
      http: true,
      tcp: false,
      ws: [1, 2, 3],
    });
    assert.strictEqual(dotGet(source, "settings.endpoints.http"), true);
    assert.deepStrictEqual(dotGet(source, "settings.connections"), source.settings.connections);
  });
});
