import { isStream } from "@weave-js/utils";
import { Readable, Writable } from "stream";
import { createNode } from "../../helper/index.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Context } from "../../../types/index.js";

describe("Streaming", () => {
  it("should return a requested stream", async () => {
    const broker1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
        level: "fatal",
      },
      transport: {
        adapter: "dummy",
      },
    });

    const broker2 = createNode({
      nodeId: "node2",
      logger: {
        enabled: false,
        level: "fatal",
      },
      transport: {
        adapter: "dummy",
      },
    });

    const testService = {
      name: "test",
      actions: {
        getStream() {
          const stream = new Readable({
            read() {},
          });

          return stream;
        },
      },
    };

    broker1.createService(testService);

    await Promise.all([broker1.start(), broker2.start()]);
    const res = await broker2.call("test.getStream");
    assert.strictEqual(isStream(res), true);
    await Promise.all([broker1.stop(), broker2.stop()]);
  });

  it("should save a stream", async () => {
    const broker1 = createNode({
      nodeId: "node4",
      logger: {
        enabled: false,
        level: "fatal",
      },
      transport: {
        adapter: "dummy",
      },
    });

    const broker2 = createNode({
      nodeId: "node5",
      logger: {
        enabled: false,
        level: "fatal",
      },
      transport: {
        adapter: "dummy",
      },
    });

    const testService = {
      name: "test",
      actions: {
        saveStream(context: Context) {
          const stream = context.stream;
          return new Promise((resolve) => {
            const chunks: { counter: number }[] = [];
            const ws = new Writable({
              objectMode: true,
              write(chunk, _, callback) {
                chunks.push(chunk);
                callback();
              },
            });

            ws.on("finish", () => {
              resolve(
                chunks
                  .map((c) => c.counter)
                  .sort()
                  .join(","),
              );
            });

            stream?.pipe(ws);
          });
        },
      },
    };

    broker1.createService(testService);

    await Promise.all([broker1.start(), broker2.start()]);

    let counter = 6;

    const stream = new Readable({
      objectMode: true,
      read() {
        if (counter < 10) {
          this.push({ counter });
        } else {
          this.push(null);
        }
        counter++;
      },
    });

    const result = await broker2.call("test.saveStream", { fileName: "dog.jpeg" }, { stream });
    assert.strictEqual(result, "6,7,8,9");
    await Promise.all([broker1.stop(), broker2.stop()]);
  });
});
