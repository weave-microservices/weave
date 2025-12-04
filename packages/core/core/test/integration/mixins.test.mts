import ServiceHookMixin from "./mixins/service-hook.mixin.mts";
import hasServiceScope from "./scope-checks/service.scope.mts";
import nested1 from "./mixins/nested1.mixin.mts";
import { createNode } from "../helper/index.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Service lifetime hooks within mixins", () => {
  it('should call lifecycle hook "created" with correct scope if there are nested hooks from a mixin.', async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    node1.createService({
      name: "testService",
      mixins: [ServiceHookMixin()],
      created() {
        hasServiceScope(this);
      },
    });
    await node1.start();
    await node1.stop();
  });

  it('should call lifecycle hook "started" with correct scope if there are nested hooks from a mixin.', async () => {
    const node1 = createNode({
      nodeId: "node1",
    });

    node1.createService({
      name: "testService",
      mixins: [ServiceHookMixin()],
      started() {
        hasServiceScope(this);
      },
    });
    await node1.start();
    await node1.stop();
  });

  it('should call lifecycle hook "stopped" with correct scope if there are nested hooks from a mixin.', async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    node1.createService({
      name: "testService",
      mixins: [ServiceHookMixin()],
      stopped() {
        hasServiceScope(this);
      },
    });
    await node1.start();
    await node1.stop();
  });
});

describe("Service lifetime hooks error handling", () => {
  it("should throw a error from a mixed started hook.", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    node1.createService({
      name: "testService",
      mixins: [ServiceHookMixin("started")],
      started() {
        // return Promise.reject(new Error('sss'))
      },
    });

    await assert.rejects(node1.start(), /Rejected hook from started/);
  });

  it("should throw a error from a mixed stopped hook.", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    node1.createService({
      name: "testService",
      mixins: [ServiceHookMixin("stopped")],
      stopped() {
        // return Promise.reject(new Error('sss'))
      },
    });

    await assert.rejects(
      node1.start().then(() => node1.stop()),
      /Rejected hook from stopped/,
    );
  });

  it("should mix in nested mixins.", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    const service = node1.createService({
      name: "testService",
      mixins: [nested1()],
      stopped() {
        // return Promise.reject(new Error('sss'))
      },
    });

    assert.notStrictEqual(service.actions.a, undefined);
    assert.notStrictEqual(service.actions.b, undefined);
    assert.notStrictEqual(service.actions.c, undefined);
    assert.strictEqual(service.actions.d, undefined);
  });
});
