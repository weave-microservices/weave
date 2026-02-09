/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { createRegistry } from "../registry/registry.mts";
import type { Runtime } from "../../types/index.js";

/**
 * Injects registry in runtime
 * @param runtime Runtime
 * @returns void
 */
export const initRegistry = (runtime: Runtime): void => {
  const registry = createRegistry(runtime);

  registry.init(runtime);

  Object.defineProperty(runtime, "registry", {
    value: registry,
  });
};
