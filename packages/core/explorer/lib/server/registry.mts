import type { Broker } from "@weave-js/core/types/index.js";
import type { ExplorerRegistry } from "../types.mts";

/**
 * The registry collections are untyped on the broker - this narrows them to what
 * the explorer reads, keeping the cast in one place.
 */
export const getRegistry = (broker: Broker): ExplorerRegistry =>
  broker.runtime.registry as unknown as ExplorerRegistry;
