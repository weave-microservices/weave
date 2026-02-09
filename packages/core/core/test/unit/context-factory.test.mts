import { initContextFactory } from "../../lib/runtime/initContextFactory.mts";
import { createFakeRuntime } from "../helper/runtime.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Test context factxory.", () => {
  it("should create an empty context.", () => {
    const runtime = createFakeRuntime({
      nodeId: "Testnode",
    });
    initContextFactory(runtime);
    const { contextFactory } = runtime;
    assert.notStrictEqual(contextFactory.create, undefined);

    // create context
    const context = contextFactory.create(null, {});
    assert.notStrictEqual(context.broadcast, undefined);
    assert.notStrictEqual(context.call, undefined);
    assert.strictEqual(context.callerNodeId, null);
    assert.deepStrictEqual(context.data, {});
    assert.strictEqual(context.duration, 0);
    assert.notStrictEqual(context.emit, undefined);
    assert.notStrictEqual(context.id, undefined);
    assert.strictEqual(context.level, 1);
    assert.deepStrictEqual(context.meta, {});
    assert.strictEqual(context.nodeId, "Testnode");
    assert.deepStrictEqual(context.options, {});
    assert.notStrictEqual(context.data, undefined);
    assert.notStrictEqual(context.requestId, undefined);
    assert.deepStrictEqual(context.requestId, context.id);
  });

  it("should handle passed options.", () => {
    const runtime = createFakeRuntime({
      nodeId: "Testnode",
    });

    initContextFactory(runtime);
    const { contextFactory } = runtime;

    assert.notStrictEqual(contextFactory.create, undefined);

    // create context
    const context = contextFactory.create(null, {}, { requestId: "fancy-request" });
    assert.notStrictEqual(context.broadcast, undefined);
    assert.notStrictEqual(context.call, undefined);
    assert.strictEqual(context.callerNodeId, null);
    assert.deepStrictEqual(context.data, {});
    assert.strictEqual(context.duration, 0);
    assert.notStrictEqual(context.emit, undefined);
    assert.notStrictEqual(context.id, undefined);
    assert.strictEqual(context.level, 1);
    assert.deepStrictEqual(context.meta, {});
    assert.strictEqual(context.nodeId, "Testnode");
    // expect(context.options).toBeDefined({})
    assert.notStrictEqual(context.data, undefined);
    assert.strictEqual(context.requestId, "fancy-request");
    assert.strictEqual(context.tracing, null);
  });

  describe("context tracing", () => {
    it("should handle parent span.", () => {
      const runtime = createFakeRuntime({
        nodeId: "Testnode",
      });

      initContextFactory(runtime);
      const { contextFactory } = runtime;

      assert.notStrictEqual(contextFactory.create, undefined);

      const parentSpan = {
        id: "span-123",
        traceId: "trace-123",
        parentId: "parent-456",
        sampled: true,
        addTags: () => {},
        setError: () => {},
      };
      // create contex

      const context = contextFactory.create(null, {}, { requestId: "fancy-request", parentSpan });
      assert.notStrictEqual(context.broadcast, undefined);
      assert.notStrictEqual(context.call, undefined);
      assert.strictEqual(context.callerNodeId, null);
      assert.deepStrictEqual(context.data, {});
      assert.strictEqual(context.duration, 0);
      assert.notStrictEqual(context.emit, undefined);
      assert.notStrictEqual(context.id, undefined);
      assert.strictEqual(context.level, 1);
      assert.deepStrictEqual(context.meta, {});
      assert.strictEqual(context.nodeId, "Testnode");
      assert.notStrictEqual(context.data, undefined);
      assert.strictEqual(context.requestId, "fancy-request");
      assert.strictEqual(context.tracing, true);
    });
  });
});
