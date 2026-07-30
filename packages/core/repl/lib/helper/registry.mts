import type { Broker } from "@weave-js/core/types/index.js";
import type { ReplRegistry } from "../types.mts";

/**
 * The registry collections are untyped on the broker - this narrows them to what
 * the REPL commands read, keeping the cast in one place.
 */
export const getRegistry = (broker: Broker): ReplRegistry =>
  broker.runtime.registry as unknown as ReplRegistry;
