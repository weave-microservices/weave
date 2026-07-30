import { createLogger } from "../../lib/logger/index.mts";
import os from "os";
import tty from "tty";
import { stripAnsi } from "../helper/strip-ansi.mts";
import * as formatUtils from "../../lib/logger/utils/format.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
const stripMessages = (messages: any[]) => messages.map((message) => stripAnsi(message[0]));

describe("Test logger module.", () => {
  it("Simple console transport", () => {
    const originalWrite = process.stdout.write;
    const calls: any[] = [];
    process.stdout.write = function (...args) {
      calls.push(args);
      return true;
    };

    const logger = createLogger({
      base: {
        service: "test",
        version: 1,
      },
    });
    logger.info("test");
    assert.strictEqual(calls.length, 1);

    if (tty.isatty(0)) {
      const strippedMessage = stripAnsi(calls[0][0]);
      assert.ok(strippedMessage.includes("INFO test"));
      assert.ok(strippedMessage.endsWith(os.EOL));
    } else {
      const logObj = JSON.parse(calls[0][0]);
      assert.strictEqual(logObj.level, 40);
      assert.strictEqual(logObj.service, "test");
      assert.strictEqual(logObj.version, 1);
      assert.strictEqual(logObj.message, "test");
      assert.ok(typeof logObj.time === "number");
    }
    process.stdout.write = originalWrite;
  });

  // it('Simple console transport', () => {
  //   const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  //   const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  //   const consoleStdOutSpy = jest.spyOn(console._stdout, 'write').mockImplementation(() => {})

  //   const logger = createLogger({
  //     base: {
  //       service: 'test',
  //       version: 1
  //     }
  //   })

  //   logger.info('test')

  //   expect(consoleErrorSpy).toBeCalledTimes(0)

  //   if (console._stdout) {
  //     expect(consoleStdOutSpy).toBeCalledTimes(1)
  //     assert.deepStrictEqual(consoleStdOutSpy.mock.calls[0], ['{"message":"test","level":"info","meta":{}}' + os.EOL])
  //   } else {
  //     expect(consoleLogSpy).toBeCalledTimes(1)
  //     assert.deepStrictEqual(consoleLogSpy.mock.calls[0], ['{"message":"test","level":"info","meta":{}}'])
  //   }

  //   consoleStdOutSpy.mockReset()
  //   consoleLogSpy.mockReset()
  //   consoleErrorSpy.mockReset()
  // })

  it("Should log types", () => {
    const originalWrite = process.stdout.write;
    const calls: any[] = [];
    process.stdout.write = function (...args) {
      calls.push(args);
      return true;
    };

    const logger = createLogger({
      base: {
        service: "test",
        version: 1,
      },
    });

    const LogObject = {
      user: "hans",
      rooms: [1, 2, 3, 4],
      lastLogin: new Date(1617198061210),
      settings: {
        app: {
          darkMode: true,
          lang: "de",
        },
      },
    };

    logger.info(["item1", "item2"]);
    logger.info(LogObject);

    assert.strictEqual(calls.length, 2);

    if (tty.isatty(0)) {
      const strippedMessage = stripMessages(calls);
      assert.ok(strippedMessage[0].includes("INFO"));
      assert.ok(strippedMessage[0].includes('"0": "item1"'));
      assert.ok(strippedMessage[1].includes("INFO"));
      assert.ok(strippedMessage[1].includes('"user": "hans"'));
    } else {
      const logObj1 = JSON.parse(calls[0][0]);
      assert.strictEqual(logObj1["0"], "item1");
      assert.strictEqual(logObj1["1"], "item2");
      assert.strictEqual(logObj1.level, 40);

      const logObj2 = JSON.parse(calls[1][0]);
      assert.strictEqual(logObj2.user, "hans");
      assert.deepStrictEqual(logObj2.rooms, [1, 2, 3, 4]);
    }

    process.stdout.write = originalWrite;
  });

  it("Should log multiple messages", () => {
    const originalWrite = process.stdout.write;
    const calls: any[] = [];
    process.stdout.write = function (...args) {
      calls.push(args);
      return true;
    };

    const logger = createLogger({
      base: {
        service: "test",
        version: 1,
      },
    });

    logger.info("message1 %s", "message2");

    assert.strictEqual(calls.length, 1);

    if (tty.isatty(0)) {
      const strippedMessage = stripMessages(calls);
      assert.ok(strippedMessage[0].includes("INFO message1 message2"));
    } else {
      const logObj = JSON.parse(calls[0][0]);
      assert.strictEqual(logObj.level, 40);
      assert.strictEqual(logObj.message, "message1 message2");
    }
    process.stdout.write = originalWrite;
  });

  it("Should log fatal messages", () => {
    const originalWrite = process.stdout.write;
    const calls: any[] = [];
    process.stdout.write = function (...args) {
      calls.push(args);
      return true;
    };

    const logger = createLogger({
      base: {
        service: "test",
        version: 1,
      },
    });

    logger.fatal("Fatal error");

    assert.strictEqual(calls.length, 1);
    if (tty.isatty(0)) {
      const strippedMessage = stripMessages(calls);
      assert.ok(strippedMessage[0].includes("FATAL Fatal error"));
    } else {
      const logObj = JSON.parse(calls[0][0]);
      assert.strictEqual(logObj.level, 10);
      assert.strictEqual(logObj.message, "Fatal error");
    }
    process.stdout.write = originalWrite;
  });

  it("Should log fatal errors", () => {
    const originalWrite = process.stdout.write;
    const calls: any[] = [];
    process.stdout.write = function (...args) {
      calls.push(args);
      return true;
    };

    const logger = createLogger({
      base: {
        service: "test",
        version: 1,
      },
    });
    const error = new Error("Fatal error");
    error.stack = "Here could be your stack!";
    logger.fatal(error, "override message");
    if (tty.isatty(0)) {
      const strippedMessage = stripMessages(calls);
      assert.ok(strippedMessage[0].includes("FATAL override message"));
      assert.ok(strippedMessage[0].includes("Here could be your stack!"));
    } else {
      const logObj = JSON.parse(calls[0][0]);
      assert.strictEqual(calls.length, 1);
      assert.strictEqual(logObj.level, 10);
      assert.strictEqual(logObj.message, "override message");
      assert.strictEqual(logObj.stack, "Here could be your stack!");
      assert.strictEqual(logObj.type, "Error");
      assert.ok(typeof logObj.time === "number");
    }

    process.stdout.write = originalWrite;
  });

  it("Should handle custom log levels", () => {
    const originalWrite = process.stdout.write;
    const calls: any[] = [];
    process.stdout.write = function (...args) {
      calls.push(args);
      return true;
    };

    const logger = createLogger({
      level: "boring" as any,
      base: {
        service: "test",
        version: 1,
      },
      customLevels: {
        boring: 80,
      },
    });
    const error = new Error("Fatal error");
    error.stack = "Here could be your stack!";
    (logger as any).boring("This is a really boring message");
    if (tty.isatty(0)) {
      const strippedMessage = stripMessages(calls);
      assert.ok(strippedMessage[0].includes("BORING This is a really boring message"));
    } else {
      const logObj = JSON.parse(calls[0][0]);
      assert.strictEqual(calls.length, 1);
      assert.strictEqual(logObj.level, 80);
      assert.strictEqual(logObj.message, "This is a really boring message");
      assert.ok(typeof logObj.time === "number");
    }

    process.stdout.write = originalWrite;
  });
});

describe("Log formatter", () => {
  it("should format log messages", () => {
    // Float, decimal, integer
    const numberString = formatUtils.format("Counter: %f, %d, %i %i", [1.5, 2.5, 3.5], undefined);
    assert.strictEqual(numberString, "Counter: 1.5, 2.5, 3 %i");

    // Strings
    const string = formatUtils.format("Name %s is %s years old.", ["Donald", 39], undefined);
    assert.strictEqual(string, "Name Donald is 39 years old.");

    // Object value
    const objString = formatUtils.format(
      "Log: %o/%o %O",
      ["Donald", { settings: { enabled: true } }],
      undefined,
    );
    assert.strictEqual(objString, 'Log: \'Donald\'/{"settings":{"enabled":true}} %O');

    // Object
    const objString2 = formatUtils.format({ settings: { enabled: true } }, ["settings"], undefined);
    assert.strictEqual(objString2, '{"settings":{"enabled":true}} ');

    // Wildcard
    const wildcardString = formatUtils.format("String %%", ["settings"], undefined);
    assert.strictEqual(wildcardString, "String %");
  });
});
