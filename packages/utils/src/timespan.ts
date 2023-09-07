
const units = {
  long: ['just now', 'nanosecond', 'microsecond', 'millisecond', 'second', 'minute', 'hour', 'day', 'week', 'year'],
  short: ['now', 'ns', 'μs', 'ms', 's', 'm', 'h', 'd', 'w', 'y']
};

const format = (num: number, unit: string, mode: UnitType) => `${num + (mode === 'short' ? '' : ' ')}${unit}${mode === 'short' || num === 1 ? '' : 's'}`;

export type Time = number

export type UnitType = 'long' | 'short'

function timespan(fromTime: number, toTime?: number, unit: UnitType = 'long') {
  // fromTime = Array.isArray(fromTime) ? fromTime[0] * 1e3 + fromTime[1] / 1e6 : fromTime;
  // toTime = Array.isArray(toTime) ? toTime[0] * 1e3 + toTime[1] / 1e6 : toTime;

  let milliseconds = Math.abs(toTime ? toTime - fromTime : fromTime);

  if (milliseconds === 0) {
    return units[unit][0];
  }

  if (milliseconds < 1e-3) {
    return format(Math.floor(milliseconds * 1e6), units[unit][1], unit);
  }

  if (milliseconds < 1) {
    return format(Math.floor(milliseconds * 1e3), units[unit][2], unit);
  }

  if (milliseconds < 1000) {
    return format(Math.floor(milliseconds), units[unit][3], unit);
  }

  if ((milliseconds /= 1000) < 60) {
    return format(Math.floor(milliseconds), units[unit][4], unit);
  }

  if ((milliseconds /= 60) < 60) {
    return format(Math.floor(milliseconds), units[unit][5], unit);
  }

  if ((milliseconds /= 60) < 24) {
    return format(Math.floor(milliseconds), units[unit][6], unit);
  }

  if ((milliseconds /= 24) < 7) {
    return format(Math.floor(milliseconds), units[unit][7], unit);
  }

  if ((milliseconds /= 7) < 52) {
    return format(Math.floor(milliseconds), units[unit][8], unit);
  }

  return format(Math.floor(milliseconds / 52), units[unit][9], unit);
}

export const timespanFromUnixTimes = timespan;
export function timespanFromUnixTimesShort (fromTime: Time, toTime?: Time) {
  return timespan(fromTime, toTime, 'short');
}
