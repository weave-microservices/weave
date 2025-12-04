// @ts-check
/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */
/**
 * @typedef {import('../types.__js').Runtime} Runtime
 */
import { createRegistry } from "../registry/registry.mts";

/**
 * Injects registy in runtime
 * @param {Runtime} runtime Runtime
 * @returns {void}
 */
export const initRegistry = (runtime) => {
  const registry = createRegistry(runtime);

  registry.init(runtime);

  Object.defineProperty(runtime, "registry", {
    value: registry,
  });
};
