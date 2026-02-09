import lolex, { type InstalledClock } from "@sinonjs/fake-timers";
import { WeaveError } from "../../lib/errors.mts";
import { createNode } from "../helper/index.mts";
import pkg from "../../package.json" with { type: "json" };
import os from "os";
import { describe, it, before, after, mock } from "node:test";
import assert from "node:assert/strict";
import type { BrokerOptions } from "../../types/index.js";

describe("Test weave logger integration.", () => {
  let clock: InstalledClock;
  before(() => {
    clock = lolex.install();
  });

  after(() => {
    clock.uninstall();
  });

  it("should provide default log methods.", () => {
    const broker = createNode({
      logger: {
        enabled: false,
        level: "fatal",
      },
    });

    assert.notStrictEqual(broker.log.info, undefined);
    assert.notStrictEqual(broker.log.debug, undefined);
    assert.notStrictEqual(broker.log.verbose, undefined);
    assert.notStrictEqual(broker.log.error, undefined);
    assert.notStrictEqual(broker.log.warn, undefined);
  });

  it("should work with log level value.", () => {
    const broker = createNode({
      logger: {
        enabled: false,
        level: 40 as unknown,
      },
    } as BrokerOptions);

    assert.notStrictEqual(broker.log.info, undefined);
    assert.notStrictEqual(broker.log.debug, undefined);
    assert.notStrictEqual(broker.log.verbose, undefined);
    assert.notStrictEqual(broker.log.error, undefined);
    assert.notStrictEqual(broker.log.warn, undefined);
  });

  it("should use the logMethod hook", () => {
    const doneHookFn = mock.fn((args: unknown[], method: Function) => {
      return method(...args);
    });

    const broker = createNode({
      nodeId: "node1",
      logger: {
        enabled: true,
        level: "fatal",
        hooks: {
          logMethod: doneHookFn,
        },
      },
    } as BrokerOptions);

    return broker
      .start()
      .then(() => {
        broker.log.fatal({ prefix: "TEST", message: "Hello" });
        assert.strictEqual(doneHookFn.mock.calls.length, 1);
      })
      .then(() => clock.uninstall())
      .then(() => broker.stop());
  });

  it("should throw an error on unknown log levels", () => {
    try {
      createNode({
        nodeId: "node1",
        logger: {
          enabled: true,
          level: "unknown!!!" as unknown,
        },
      } as BrokerOptions);
    } catch (error) {
      assert.ok(error instanceof WeaveError);
      assert.strictEqual(error.message, 'Unknown level: "unknown!!!"');
    }
  });

  it("should throw an error on unknown log levels values", () => {
    try {
      createNode({
        nodeId: "node1",
        logger: {
          enabled: true,
          level: 110 as unknown,
        },
      } as BrokerOptions);
    } catch (error) {
      assert.ok(error instanceof WeaveError);
      assert.strictEqual(error.message, 'Unknown level value: "110"');
    }
  });

  it("should log error objects", () => {
    const logMethod = mock.fn((args: unknown[], method: Function) => {
      return method(...args);
    });
    const broker = createNode({
      nodeId: "node1",
      logger: {
        enabled: true,
        level: 60 as unknown,
        hooks: {
          logMethod,
        },
      },
    } as BrokerOptions);

    return broker.start().then(() => {
      broker.log.info(new Error("Error message text."));
      assert.strictEqual(logMethod.mock.calls.length, 4);
    });
  });
});

describe("Test logger transporter streams.", () => {
  let clock: InstalledClock;
  before(() => {
    clock = lolex.install();
  });

  after(() => {
    clock.uninstall();
  });

  it("should log through console trans", () => {
    const consoleSpy = mock.method(process.stdout, "write", () => {});

    createNode({
      nodeId: "loggerNode",
      logger: {
        base: {
          pid: 0,
          hostname: "my-host.com",
        },
      },
    });

    const version = pkg.version;

    const calls = [
      [`INFO [1970-01-01T00:00:00.000Z]  Initializing #weave node version ${version}` + os.EOL],
      [
        '{"level":4,"time":0,"nodeId":"loggerNode","moduleName":"WEAVE","pid":0,"hostname":"my-host.com","message":"Node Id: loggerNode"}' +
          os.EOL,
      ],
    ];

    consoleSpy.mock.calls.forEach((call, i) => {
      assert.deepStrictEqual(call.arguments, calls[i]);
    });

    consoleSpy.mock.restore();
  });
});
