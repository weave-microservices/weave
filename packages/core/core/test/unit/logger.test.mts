import { createLogger } from "../../lib/logger/index.mts";
import os from "os";
import lolex from "@sinonjs/fake-timers";
import tty from "tty";
import { stripAnsi } from "../helper/strip-ansi.mts";
import * as formatUtils from "../../lib/logger/utils/format.mts";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
const stripMessages = (messages) => messages.map((message) => stripAnsi(message[0]));

describe("Test logger module.", () => {
  let clock;
  before(() => {
    clock = lolex.install();
  });

  after(() => {
    clock.uninstall();
  });

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
      assert.deepStrictEqual(strippedMessage, "INFO [1970-01-01T00:00:00.000Z]  test" + os.EOL);
    } else {
      assert.deepStrictEqual(calls[0], [
        '{"level":40,"time":0,"service":"test","version":1,"message":"test"}' + os.EOL,
      ]);
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
      assert.deepStrictEqual(
        strippedMessage[0],
        'INFO [1970-01-01T00:00:00.000Z] \n{\n  "0": "item1",\n  "1": "item2"\n}' + os.EOL,
      );
      assert.deepStrictEqual(
        strippedMessage[1],
        'INFO [1970-01-01T00:00:00.000Z] \n{\n  "user": "hans",\n  "rooms": [\n    1,\n    2,\n    3,\n    4\n  ],\n  "lastLogin": "2021-03-31T13:41:01.210Z",\n  "settings": {\n    "app": {\n      "darkMode": true,\n      "lang": "de"\n    }\n  }\n}' +
          os.EOL,
      );
    } else {
      assert.deepStrictEqual(calls[0], [
        '{"0":"item1","1":"item2","level":40,"time":0,"service":"test","version":1}' + os.EOL,
      ]);
      assert.deepStrictEqual(calls[1], [
        '{"level":40,"time":0,"service":"test","version":1,"user":"hans","rooms":[1,2,3,4],"lastLogin":"2021-03-31T13:41:01.210Z","settings":{"app":{"darkMode":true,"lang":"de"}}}' +
          os.EOL,
      ]);
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
      assert.deepStrictEqual(
        strippedMessage[0],
        "INFO [1970-01-01T00:00:00.000Z]  message1 message2" + os.EOL,
      );
    } else {
      assert.deepStrictEqual(calls[0], [
        '{"level":40,"time":0,"service":"test","version":1,"message":"message1 message2"}' + os.EOL,
      ]);
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
      assert.deepStrictEqual(
        strippedMessage[0],
        "FATAL [1970-01-01T00:00:00.000Z]  Fatal error" + os.EOL,
      );
    } else {
      assert.deepStrictEqual(calls[0], [
        '{"level":10,"time":0,"service":"test","version":1,"message":"Fatal error"}' + os.EOL,
      ]);
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
      assert.deepStrictEqual(
        strippedMessage[0],
        'FATAL [1970-01-01T00:00:00.000Z]  override message\n{\n  "stack": "Here could be your stack!",\n  "type": "Error"\n}' +
          os.EOL,
      );
    } else {
      const logObj = JSON.parse(calls[0]);
      assert.strictEqual(calls.length, 1);
      assert.strictEqual(logObj.level, 10);
      assert.strictEqual(logObj.message, "override message");
      assert.strictEqual(logObj.stack, "Here could be your stack!");
      assert.strictEqual(logObj.type, "Error");
      assert.strictEqual(logObj.time, 0);
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
      level: "boring",
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
    logger.boring("This is a really boring message");
    if (tty.isatty(0)) {
      const strippedMessage = stripMessages(calls);
      assert.deepStrictEqual(
        strippedMessage[0],
        "BORING [1970-01-01T00:00:00.000Z]  This is a really boring message" + os.EOL,
      );
    } else {
      const logObj = JSON.parse(calls[0]);
      assert.strictEqual(calls.length, 1);
      assert.strictEqual(logObj.level, 80);
      assert.strictEqual(logObj.message, "This is a really boring message");
      assert.strictEqual(logObj.time, 0);
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
