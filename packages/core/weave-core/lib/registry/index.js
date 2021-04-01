// @ts-check
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
*/

const { createRegistry } = require('./registry.js')

const noop = () => {}

/**
 * Registry factory
 * @param {Runtime} runtime Runtime
 * @returns {void} Registry
*/
exports.initRegistry = (runtime) => {
  const registry = createRegistry(runtime)

  registry.init(runtime)

  Object.defineProperty(runtime, 'registry', {
    value: registry
  })
}
