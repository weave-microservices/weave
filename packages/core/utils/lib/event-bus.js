const EventEmitter = require('events').EventEmitter;

/**
 * Create a new instance of EventEmitter
 * @returns {EventEmitter}
 */
exports.createEventEmitter = () => EventEmitter.prototype;
