// @ts-check
/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
*/

import { Runtime } from "./Runtime";

const { createRegistry } = require('../registry/registry.js');

/**
 * Injects registy in runtime
 * @param {Runtime} runtime Runtime
 * @returns {void}
*/
exports.initRegistry = (runtime: Runtime) => {
  const registry = createRegistry(runtime);

  registry.init(runtime);

  Object.defineProperty(runtime, 'registry', {
    value: registry
  });
};
