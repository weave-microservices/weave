/**
 * Tracing collectors for distributed tracing and observability
 *
 * Provides pluggable collectors that capture and export trace data:
 * - Event: Event-based collector that emits trace spans as events
 * - BaseCollector: Abstract base class for custom collector implementations
 *
 * Collectors can be resolved by name (string) or provided as constructor functions/instances.
 * They handle span lifecycle management, trace context propagation, and data export
 * to various observability backends like Jaeger, Zipkin, or custom systems.
 *
 * @namespace TracingCollectors
 */

const { isFunction } = require('@weave-js/utils');

const collectors = {
  Event: require('./event'),
  BaseCollector: require('./base')
};

/**
 * Get a tracing collector by name (case-insensitive lookup)
 * @param {string} name Tracing collector name (e.g., 'Event', 'BaseCollector')
 * @returns {import('../../../types').TracingCollector} The collector constructor or undefined if not found
 */
const getByName = (name) => {
  const n = Object.keys(collectors).find(collectorName => collectorName.toLowerCase() === name.toLowerCase());
  return collectors[n];
};

/**
 * Resolve a tracing collector by name, function, or object
 *
 * Supports multiple collector resolution patterns:
 * - String: Looks up collector by name ('Event', 'BaseCollector')
 * - Function: Calls function with runtime to get collector instance
 * - Object: Returns object directly as collector instance
 * - Constructor: Instantiates with new operator
 *
 * @param {import('../../../types').Runtime} runtime Runtime instance for collector initialization
 * @param {string | Function | Object | import('../../../types').TracingCollector} collector Tracing collector specification
 * @returns {import('../../../types').TracingCollector} Resolved collector instance
 * @throws {Error} When collector cannot be resolved or is not found
 */
exports.resolveCollector = (runtime, collector) => {
  let CollectorClass;
  if (typeof collector === 'string') {
    CollectorClass = getByName(collector);
  }

  if (isFunction(collector)) {
    return collector(runtime);
  }

  if (typeof collector === 'object') {
    return collector;
  }

  if (!CollectorClass) {
    runtime.handleError(new Error('Tracer not found'));
  }

  return new CollectorClass(collector);
};

exports.Base = collectors.BaseCollector;

exports.Console = collectors.Console;

exports.Event = collectors.Event;
