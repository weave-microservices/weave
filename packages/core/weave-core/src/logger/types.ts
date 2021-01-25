import figures from 'figures'
import { LogLevel } from '../shared/enums/log-level.enum'

export function createLogLevel(badge: string, color: string, label: string, logLevel: LogLevel) {
  return {
    badge,
    color,
    label,
    logLevel
  }
}

export const defaultTypes = {
  log: createLogLevel('', '', '', LogLevel.Info),
  info: createLogLevel(figures.info, 'blue', 'info', LogLevel.Info),
  success: createLogLevel(figures.tick, 'green', 'success', LogLevel.Info),
  progress: createLogLevel(figures.pointer, 'yellow', 'progress', LogLevel.Info),
  debug: createLogLevel(figures('⬤'), 'red', 'debug', LogLevel.Debug),
  trace: createLogLevel(figures('⬤'), 'gray', 'trace', LogLevel.Trace),
  error: createLogLevel(figures.cross, 'red', 'error', LogLevel.Error),
  fatal: createLogLevel('!!', 'red', 'fatal', LogLevel.Fatal),
  warn: createLogLevel(figures.warning, 'yellow', 'warning', LogLevel.Warn),
  wait: createLogLevel(figures.ellipsis, 'blue', 'waiting', LogLevel.Info),
  completed: createLogLevel(figures.checkboxOn, 'cyan', 'completed', LogLevel.Info),
  note: createLogLevel(figures.bullet, 'blue', 'note', LogLevel.Info),
  star: createLogLevel(figures.star, 'yellow', 'star', LogLevel.Info),
  fav: createLogLevel(figures('❤'), 'magenta', 'favorite', LogLevel.Info)
}
