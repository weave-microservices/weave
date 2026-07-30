import { createNode } from "../helper/index.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Test param validator", () => {
  it("should fail with error and validation data.", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    node1.createService({
      name: "testService",
      actions: {
        sayHello: {
          params: {
            name: { type: "string", minLength: 10 },
          },
          handler(context) {
            return `Hello ${context.data.name}!`;
          },
        },
      },
    });

    await node1.start();
    await assert.rejects(node1.call("testService.sayHello", { name: "Hans" }), (error: any) => {
      assert.strictEqual(error.name, "WeaveParameterValidationError");
      assert.strictEqual(error.message, "Request parameter validation error");
      return true;
    });
  });

  it("should fail with error and validation data (short form).", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    node1.createService({
      name: "testService",
      actions: {
        sayHello: {
          params: {
            name: "string",
          },
          handler(context) {
            return `Hello ${context.data.name}!`;
          },
        },
      },
    });

    await node1.start();
    await assert.rejects(node1.call("testService.sayHello", { name: 1 }), (error: any) => {
      assert.strictEqual(error.name, "WeaveParameterValidationError");
      assert.strictEqual(error.message, "Request parameter validation error");
      return true;
    });
  });
});

describe("Validator strict mode", () => {
  it('should remove invalid params on strict mode "remove" (global)', async () => {
    const node1 = createNode({
      nodeId: "node_strict",
      logger: {
        enabled: false,
      },
      validatorOptions: {
        strict: true,
        strictMode: "remove",
      },
    });

    let handlerCalled = false;

    node1.createService({
      name: "testService",
      actions: {
        sayHello: {
          params: {
            name: { type: "string" },
          },
          handler(context) {
            assert.strictEqual(context.data.name, "Hans");
            assert.strictEqual(context.data.lastname, undefined);
            handlerCalled = true;
          },
        },
      },
    });

    await node1.start();
    await node1.call("testService.sayHello", { name: "Hans", lastname: "hans" });
    assert.strictEqual(handlerCalled, true);
  });

  it('should throw an error if there are invalid params on strict mode "error" (global)', async () => {
    const node1 = createNode({
      nodeId: "node_strict",
      logger: {
        enabled: false,
      },
      validatorOptions: {
        strict: true,
        strictMode: "error",
      },
    });

    node1.createService({
      name: "testService",
      actions: {
        sayHello: {
          params: {
            name: { type: "string" },
          },
          handler() {
            // nothing to do
          },
        },
      },
    });

    await node1.start();
    await assert.rejects(
      node1.call("testService.sayHello", { name: "Hans", lastname: "hans" }),
      (error: any) => {
        assert.strictEqual(error.data.length, 1);
        const [validationError] = error.data;

        assert.strictEqual(validationError.action, "testService.sayHello");
        assert.strictEqual(validationError.expected, "name");
        assert.strictEqual(validationError.field, "$root");
        assert.strictEqual(
          validationError.message,
          'The object "$root" contains forbidden keys: "lastname".',
        );
        assert.strictEqual(validationError.nodeId, "node_strict");
        assert.strictEqual(validationError.passed, "lastname");
        assert.strictEqual(validationError.type, "objectStrict");
        return true;
      },
    );
  });
});

describe("Response validator", () => {
  it("Should validate responses (fails)", async () => {
    const broker1 = createNode({
      nodeId: "node_strict",
      logger: {
        enabled: false,
      },
      validatorOptions: {
        strict: true,
        strictMode: "error",
      },
    });

    broker1.createService({
      name: "testService",
      actions: {
        sayHello: {
          params: {
            name: { type: "string" },
          },
          // @ts-expect-error - responseSchema accepts legacy object format
          responseSchema: {
            firstname: { type: "string" },
            lastname: { type: "string" },
          },
          handler(context) {
            if (context.data.name === "RightName") {
              return { firstname: "Right", lastname: "Name" };
            }
            return {
              text: "Hello User!",
              user: {
                firstname: context.data,
                lastname: "Wick",
              },
            };
          },
        },
      },
    });

    await broker1.start();
    await assert.rejects(broker1.call("testService.sayHello", { name: "Hans" }), (error: any) => {
      assert.strictEqual(error.data.length, 3);
      const [validationError] = error.data;

      assert.strictEqual(validationError.action, "testService.sayHello");
      assert.strictEqual(validationError.field, "firstname");
      return true;
    });

    const result = await broker1.call("testService.sayHello", { name: "RightName" });
    assert.deepStrictEqual(result, { firstname: "Right", lastname: "Name" });
  });
});
