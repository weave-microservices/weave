const units = {
  long: ['just now', 'nanosecond', 'microsecond', 'millisecond', 'second', 'minute', 'hour', 'day', 'week', 'year'],
  short: ['now', 'ns', 'μs', 'ms', 's', 'm', 'h', 'd', 'w', 'y']
};

type UnitMode = 'long' | 'short';

const format = (num: number, unit: string, mode: UnitMode): string => 
  `${num + (mode === 'short' ? '' : ' ')}${unit}${mode === 'short' || num === 1 ? '' : 's'}`;

/**
 * Format time span as string with unit.
 * @param fromTime - From time
 * @param toTime - To time
 * @param unit - Format unit
 * @returns Formatted timespan string
 */
function timespan(fromTime: number | [number, number], toTime: number | [number, number], unit: UnitMode = 'long'): string {
  const fromMs = Array.isArray(fromTime) ? fromTime[0] * 1e3 + fromTime[1] / 1e6 : fromTime;
  const toMs = Array.isArray(toTime) ? toTime[0] * 1e3 + toTime[1] / 1e6 : toTime;

  let milliseconds = Math.abs(isNaN(+toMs) ? fromMs : toMs - fromMs);

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

/**
 * Format a timespan as string
 * @param fromTime - From time
 * @param toTime - To time
 * @returns Formatted time span string
 */
export function timespanFromUnixTimes(fromTime: number, toTime: number): string {
  return timespan(fromTime, toTime, 'long');
}

/**
 * Format a timespan as short string
 * @param fromTime - From time
 * @param toTime - To time
 * @returns Formatted time span string
 */
export function timespanFromUnixTimesShort(fromTime: number, toTime: number): string {
  return timespan(fromTime, toTime, 'short');
}
