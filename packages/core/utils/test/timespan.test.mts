import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { timespanFromUnixTimes, timespanFromUnixTimesShort } from "../lib/timespan.mts";

describe("Timespan function", () => {
  it('should return "just now"', () => {
    const time = 0;
    const resultLong = timespanFromUnixTimes(time, time);
    const resultShort = timespanFromUnixTimesShort(time, time);

    assert.strictEqual(resultLong, "just now");
    assert.strictEqual(resultShort, "now");
  });

  it("should return nanoseconds", () => {
    const time = 0.000001;
    const resultLong = timespanFromUnixTimes(0, time);
    const resultShort = timespanFromUnixTimesShort(0, time);

    assert.strictEqual(resultLong, "1 nanosecond");
    assert.strictEqual(resultShort, "1ns");
  });

  it("should return microseconds", () => {
    const time = 0.001;
    const resultLong = timespanFromUnixTimes(0, time);
    const resultShort = timespanFromUnixTimesShort(0, time);

    assert.strictEqual(resultLong, "1 microsecond");
    assert.strictEqual(resultShort, "1μs");
  });

  it("should return milliseconds", () => {
    const time = 1;
    const resultLong = timespanFromUnixTimes(0, time);
    const resultShort = timespanFromUnixTimesShort(0, time);

    assert.strictEqual(resultLong, "1 millisecond");
    assert.strictEqual(resultShort, "1ms");
  });

  it("should return seconds", () => {
    const time = 1000;
    const resultLong = timespanFromUnixTimes(0, time);
    const resultShort = timespanFromUnixTimesShort(0, time);

    assert.strictEqual(resultLong, "1 second");
    assert.strictEqual(resultShort, "1s");
  });

  it("should return minutes", () => {
    const time = 1000 * 60;
    const resultLong = timespanFromUnixTimes(0, time);
    const resultShort = timespanFromUnixTimesShort(0, time);

    assert.strictEqual(resultLong, "1 minute");
    assert.strictEqual(resultShort, "1m");
  });

  it("should return hours", () => {
    const time = 1000 * 60 * 60;
    const resultLong = timespanFromUnixTimes(0, time);
    const resultShort = timespanFromUnixTimesShort(0, time);

    assert.strictEqual(resultLong, "1 hour");
    assert.strictEqual(resultShort, "1h");
  });

  it("should return days", () => {
    const time = 1000 * 60 * 60 * 24;
    const resultLong = timespanFromUnixTimes(0, time);
    const resultShort = timespanFromUnixTimesShort(0, time);

    assert.strictEqual(resultLong, "1 day");
    assert.strictEqual(resultShort, "1d");
  });

  it("should return weeks", () => {
    const time = 1000 * 60 * 60 * 24 * 7;
    const resultLong = timespanFromUnixTimes(0, time);
    const resultShort = timespanFromUnixTimesShort(0, time);

    assert.strictEqual(resultLong, "1 week");
    assert.strictEqual(resultShort, "1w");
  });

  it("should return years", () => {
    const time = 1000 * 60 * 60 * 24 * 7 * 52;
    const resultLong = timespanFromUnixTimes(0, time);
    const resultShort = timespanFromUnixTimesShort(0, time);

    assert.strictEqual(resultLong, "1 year");
    assert.strictEqual(resultShort, "1y");
  });
});
