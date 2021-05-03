/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
'use strict'

const { createContextFactory } = require('./context-factory')

exports.initContextFactory = (runtime) => {
  Object.defineProperty(runtime, 'contextFactory', {
    value: createContextFactory(runtime)
  })
}
