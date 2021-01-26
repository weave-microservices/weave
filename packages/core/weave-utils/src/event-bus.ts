const EventEmitter = require('events').EventEmitter
export function createEventEmitter() {
  return EventEmitter.prototype
}
