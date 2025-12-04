import { asHumanReadable } from "../../../lib/logger/format/asHumanReadable.mts";
import { mappings } from "../../../lib/logger/levels.mts";
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

const levels = {
  FATAL: 10,
  ERROR: 20,
  WARN: 30,
  INFO: 40,
  DEBUG: 50,
  VERBOSE: 60,
  TRACE: 60, // alias for verbose
};

describe("Human Readable Logger Format", () => {
  let mockRuntime;

  beforeEach(() => {
    mockRuntime = {
      levels: mappings(),
      options: {
        base: {
          pid: 12345,
          hostname: "test-hostname",
        },
        logger: {
          colors: true,
        },
      },
    };
  });

  it("should format log entry with all fields", () => {
    const originObj = {
      nodeId: "test-node",
      moduleName: "TEST",
      data: { key: "value" },
      meta: { request: "test" },
    };
    const message = "Test message";
    const number = levels.INFO;
    const time = 1609459200000; // Fixed timestamp for consistent testing

    const result = asHumanReadable(mockRuntime, originObj, message, number, time);

    assert.ok(result.includes("Test message"));
    assert.strictEqual(typeof result, "string");
  });

  it("should format log entry without colors", () => {
    mockRuntime.options.logger.colors = false;

    const originObj = {
      nodeId: "test-node",
      moduleName: "ERROR_TEST",
    };
    const message = "Error message";
    const number = levels.ERROR;
    const time = 1609459200000;

    const result = asHumanReadable(mockRuntime, originObj, message, number, time);

    assert.ok(result.includes("Error message"));
    assert.strictEqual(typeof result, "string");
  });

  it("should format log entry with different log levels", () => {
    const logLevels = [
      levels.TRACE,
      levels.DEBUG,
      levels.INFO,
      levels.WARN,
      levels.ERROR,
      levels.FATAL,
    ];

    logLevels.forEach((level) => {
      const originObj = {
        nodeId: "test-node",
        moduleName: "LEVEL_TEST",
      };
      const message = `Message at level ${level}`;
      const number = level;
      const time = 1609459200000;

      const result = asHumanReadable(mockRuntime, originObj, message, number, time);
      assert.strictEqual(typeof result, "string");
      assert.ok(result.length > 0);
    });
  });

  it("should handle log entry with error object", () => {
    const error = new Error("Test error");
    error.stack = "Error: Test error\n    at test.js:1:1";

    const originObj = {
      nodeId: "test-node",
      moduleName: "ERROR_TEST",
      error: error,
    };
    const message = "Error occurred";
    const number = levels.ERROR;
    const time = 1609459200000;

    const result = asHumanReadable(mockRuntime, originObj, message, number, time);

    assert.ok(result.includes("Error occurred"));
    assert.strictEqual(typeof result, "string");
  });

  it("should handle log entry with minimal data", () => {
    const originObj = {};
    const message = "Simple message";
    const number = levels.INFO;
    const time = Date.now();

    const result = asHumanReadable(mockRuntime, originObj, message, number, time);

    assert.ok(result.includes("Simple message"));
    assert.strictEqual(typeof result, "string");
  });

  it("should handle log entry with complex data objects", () => {
    const originObj = {
      nodeId: "test-node",
      moduleName: "DEBUG_TEST",
      data: {
        nested: {
          object: {
            with: ["array", "values"],
          },
        },
        number: 42,
        boolean: true,
      },
    };
    const message = "Debug message";
    const number = levels.DEBUG;
    const time = 1609459200000;

    const result = asHumanReadable(mockRuntime, originObj, message, number, time);

    assert.ok(result.includes("Debug message"));
    assert.strictEqual(typeof result, "string");
  });
});
