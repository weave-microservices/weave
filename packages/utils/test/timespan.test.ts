import * as utils from '../src';

describe('Timespan function', () => {
  it('should return "just now"', () => {
    const time = 0;
    const resultLong = utils.timespanFromUnixTimes(time);
    const resultShort = utils.timespanFromUnixTimesShort(time);

    expect(resultLong).toBe('just now');
    expect(resultShort).toBe('now');
  });

  it('should return nanoseconds', () => {
    const time = 0.000001;
    const resultLong = utils.timespanFromUnixTimes(time);
    const resultShort = utils.timespanFromUnixTimesShort(time);

    expect(resultLong).toBe('1 nanosecond');
    expect(resultShort).toBe('1ns');
  });

  it('should return microseconds', () => {
    const time = 0.001;
    const resultLong = utils.timespanFromUnixTimes(time);
    const resultShort = utils.timespanFromUnixTimesShort(time);

    expect(resultLong).toBe('1 microsecond');
    expect(resultShort).toBe('1μs');
  });

  it('should return milliseconds', () => {
    const time = 1;
    const resultLong = utils.timespanFromUnixTimes(time);
    const resultShort = utils.timespanFromUnixTimesShort(time);

    expect(resultLong).toBe('1 millisecond');
    expect(resultShort).toBe('1ms');
  });

  it('should return seconds', () => {
    const time = 1000;
    const resultLong = utils.timespanFromUnixTimes(time);
    const resultShort = utils.timespanFromUnixTimesShort(time);

    expect(resultLong).toBe('1 second');
    expect(resultShort).toBe('1s');
  });

  it('should return minutes"', () => {
    const time = 1000 * 60;
    const resultLong = utils.timespanFromUnixTimes(time);
    const resultShort = utils.timespanFromUnixTimesShort(time);

    expect(resultLong).toBe('1 minute');
    expect(resultShort).toBe('1m');
  });

  it('should return hours', () => {
    const time = 1000 * 60 * 60;
    const resultLong = utils.timespanFromUnixTimes(time);
    const resultShort = utils.timespanFromUnixTimesShort(time);

    expect(resultLong).toBe('1 hour');
    expect(resultShort).toBe('1h');
  });

  it('should return days', () => {
    const time = 1000 * 60 * 60 * 24;
    const resultLong = utils.timespanFromUnixTimes(time);
    const resultShort = utils.timespanFromUnixTimesShort(time);

    expect(resultLong).toBe('1 day');
    expect(resultShort).toBe('1d');
  });

  it('should return "just now"', () => {
    const time = 1000 * 60 * 60 * 24 * 7;
    const resultLong = utils.timespanFromUnixTimes(time);
    const resultShort = utils.timespanFromUnixTimesShort(time);

    expect(resultLong).toBe('1 week');
    expect(resultShort).toBe('1w');
  });

  it('should return "just now"', () => {
    const time = 1000 * 60 * 60 * 24 * 7 * 52;
    const resultLong = utils.timespanFromUnixTimes(time);
    const resultShort = utils.timespanFromUnixTimesShort(time);

    expect(resultLong).toBe('1 year');
    expect(resultShort).toBe('1y');
  });
});
