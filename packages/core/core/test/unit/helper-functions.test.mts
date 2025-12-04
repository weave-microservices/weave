import defineAction from "../../lib/helper/defineAction.mts";
import defineBrokerOptions from "../../lib/helper/defineBrokerOptions.mts";
import defineService from "../../lib/helper/defineService.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Helper Functions", () => {
  describe("defineAction", () => {
    it("should return the action definition", () => {
      const actionDef = {
        name: "testAction",
        handler: () => {},
      };

      const result = defineAction(actionDef);
      assert.strictEqual(result, actionDef);
    });

    it("should return complex action definitions", () => {
      const actionDef = {
        name: "complexAction",
        params: {
          name: "string",
          age: "number",
        },
        handler: () => {},
        cache: true,
        timeout: 5000,
      };

      const result = defineAction(actionDef);
      assert.strictEqual(result, actionDef);
      assert.notStrictEqual(result.params, undefined);
      assert.strictEqual(result.cache, true);
      assert.strictEqual(result.timeout, 5000);
    });
  });

  describe("defineBrokerOptions", () => {
    it("should return the broker options", () => {
      const options = {
        nodeId: "test-node",
        logger: { enabled: true },
        transport: { adapter: "dummy" },
      };

      const result = defineBrokerOptions(options);
      assert.strictEqual(result, options);
    });

    it("should return complex broker options", () => {
      const options = {
        nodeId: "complex-node",
        namespace: "test",
        logger: {
          enabled: true,
          level: "debug",
        },
        transport: {
          adapter: "tcp",
          options: {
            port: 4222,
          },
        },
        metrics: {
          enabled: true,
        },
      };

      const result = defineBrokerOptions(options);
      assert.strictEqual(result, options);
      assert.strictEqual(result.namespace, "test");
      assert.strictEqual(result.logger.level, "debug");
      assert.strictEqual(result.transport.options.port, 4222);
    });
  });

  describe("defineService", () => {
    it("should return the service definition", () => {
      const serviceDef = {
        name: "testService",
        actions: {
          test: () => {},
        },
      };

      const result = defineService(serviceDef);
      assert.strictEqual(result, serviceDef);
    });

    it("should return complex service definitions", () => {
      const serviceDef = {
        name: "complexService",
        version: 2,
        settings: {
          timeout: 5000,
        },
        mixins: [],
        actions: {
          action1: {
            params: {
              name: "string",
            },
            handler: () => {},
          },
          action2: () => {},
        },
        events: {
          "user.created": () => {},
        },
        created: () => {},
        started: () => {},
        stopped: () => {},
      };

      const result = defineService(serviceDef);
      assert.strictEqual(result, serviceDef);
      assert.strictEqual(result.version, 2);
      assert.strictEqual(result.settings.timeout, 5000);
      assert.notStrictEqual(result.actions.action1.params, undefined);
      assert.notStrictEqual(result.events["user.created"], undefined);
    });

    it("should handle service with minimal definition", () => {
      const serviceDef = {
        name: "minimalService",
      };

      const result = defineService(serviceDef);
      assert.strictEqual(result, serviceDef);
      assert.strictEqual(result.name, "minimalService");
    });
  });
});
