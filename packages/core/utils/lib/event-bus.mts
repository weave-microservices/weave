import { EventEmitter } from "node:events";

/**
 * Create a new instance of EventEmitter
 * @returns EventEmitter instance
 */
export function createEventEmitter(): typeof EventEmitter.prototype {
  return EventEmitter.prototype;
}
