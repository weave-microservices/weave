import { getDefaultOptions } from './broker/defaultOptions.mts';
import { defaultsDeep } from '@weave-js/utils';
import { initRuntime } from './buildRuntime.mts';
import { createBrokerInstance } from './broker/index.mts';
import * as Errors from './errors.mts';
import * as Constants from './constants.mts';
import * as Cache from './cache/adapters/index.mts';
import { createBaseTracingCollector } from './tracing/collectors/base.mts';
import TransportAdapters from './transport/adapters/index.mts';
import * as TracingAdapters from './tracing/collectors/index.mts';
import defineBrokerOptions from './helper/defineBrokerOptions.mts';
import defineService from './helper/defineService.mts';
import defineAction from './helper/defineAction.mts';
import type { BrokerOptions, Broker } from '../types/index.js';

/**
 * Default broker configuration options
 */
export const defaultOptions = getDefaultOptions();

/**
 * Creates a new Weave broker instance with the provided configuration
 * @param options - Broker configuration options
 * @returns A new Broker instance
 * @example
 * import { createBroker } from '@weave-js/core';
 *
 * const broker = createBroker({
 *   nodeId: 'my-service',
 *   logger: { level: 'info' },
 *   transport: { adapter: 'TCP' }
 * });
 *
 * broker.start();
 */
export const createBroker = (options?: BrokerOptions): Broker => {
  const defaultOpts = getDefaultOptions();

  const mergedOptions = defaultsDeep(options, defaultOpts) as BrokerOptions;

  const runtime = initRuntime(mergedOptions);
  const broker = createBrokerInstance(runtime);

  // Establish circular reference for graceful shutdown in fatal errors
  runtime.broker = broker;

  return broker;
};

/**
 * @deprecated since version 0.9.0 - Use createBroker instead
 * @param options - Broker configuration options
 * @returns A new Broker instance
 */
export const Weave = createBroker;

/**
 * Weave error classes and utilities
 * @namespace
 */
export { Errors };

/**
 * Weave constants and internal identifiers
 * @namespace
 */
export { Constants };

/**
 * Cache adapter implementations
 * @namespace
 */
export { Cache };

/**
 * @deprecated since version 0.10.0 - Use TracingAdapters instead
 */
export { createBaseTracingCollector };

/**
 * Transport adapter implementations
 * @namespace
 */
export { TransportAdapters };

/**
 * Tracing collector implementations
 * @namespace
 */
export { TracingAdapters };

/**
 * Cache adapter implementations (alias for Cache)
 * @namespace
 */
export { Cache as CacheAdapters };

/**
 * Helper function for type-safe broker option definitions
 * @function
 */
export { defineBrokerOptions };

/**
 * Helper function for type-safe service definitions
 * @function
 */
export { defineService };

/**
 * Helper function for type-safe action definitions
 * @function
 */
export { defineAction };

let broker = createBroker();
