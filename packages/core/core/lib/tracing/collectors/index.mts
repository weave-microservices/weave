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

import { isFunction } from "@weave-js/utils";
import type { Runtime } from "../../../types/index.js";

const collectors = {
  Event: await import("./event.mts"),
  BaseCollector: await import("./base.mts"),
} as const;

type CollectorName = keyof typeof collectors;

/**
 * Get a tracing collector by name (case-insensitive lookup)
 * @param {string} name Tracing collector name (e.g., 'Event', 'BaseCollector')
 * @returns The collector constructor or undefined if not found
 */
const getByName = (name: string): (typeof collectors)[CollectorName] | undefined => {
  const n = Object.keys(collectors).find(
    (collectorName) => collectorName.toLowerCase() === name.toLowerCase(),
  ) as CollectorName | undefined;
  if (n) {
    return collectors[n];
  }
  return undefined;
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
 * @param runtime Runtime instance for collector initialization
 * @param collector Tracing collector specification
 * @returns Resolved collector instance
 * @throws {Error} When collector cannot be resolved or is not found
 */
export const resolveCollector = (
  runtime: Runtime,
  collector: string | ((...args: unknown[]) => unknown) | object,
): unknown => {
  let CollectorClass: (typeof collectors)[CollectorName] | undefined;
  if (typeof collector === "string") {
    CollectorClass = getByName(collector);
  }

  if (isFunction(collector)) {
    return (collector as (runtime: Runtime) => unknown)(runtime);
  }

  if (typeof collector === "object") {
    return collector;
  }

  if (!CollectorClass) {
    runtime.handleError(new Error("Tracer not found"));
  }

  return CollectorClass;
};

export const Base = collectors.BaseCollector;

export const Event = collectors.Event;
