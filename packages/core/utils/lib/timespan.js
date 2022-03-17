
const units = {
  long: ['just now', 'nanosecond', 'microsecond', 'millisecond', 'second', 'minute', 'hour', 'day', 'week', 'year'],
  short: ['now', 'ns', 'μs', 'ms', 's', 'm', 'h', 'd', 'w', 'y']
};

const format = (num, unit, mode) => `${num + (mode === 'short' ? '' : ' ')}${unit}${mode === 'short' || num === 1 ? '' : 's'}`;

function timespan (fromTime, toTime, unit) {
  unit = typeof arguments[arguments.length - 1] === 'string' ? arguments[arguments.length - 1] : 'long';
  fromTime = Array.isArray(fromTime) ? fromTime[0] * 1e3 + fromTime[1] / 1e6 : fromTime;
  toTime = Array.isArray(toTime) ? toTime[0] * 1e3 + toTime[1] / 1e6 : toTime;

  let milliseconds = Math.abs(isNaN(+toTime) ? fromTime : toTime - fromTime);

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

exports.timespanFromUnixTimes = timespan;
exports.timespanFromUnixTimesShort = (fromTime, toTime) => timespan(fromTime, toTime, 'short');
