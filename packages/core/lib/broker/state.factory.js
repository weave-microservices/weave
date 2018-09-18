/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const stateFactory = ({ pkg, createId, Errors }) =>
    options => {
        const state = Object.create(null)

        state.options = options
        state.nodeId = options.nodeId || createId()
        state.namespace = options.namespace
        state.version = pkg.version
        state.services = []
        state.middlewares = []
        state.isStarted = false
        state.waitForServiceInterval = null
        state.actionCount = 0

        if (options.started && typeof options.started !== 'function') {
            throw new Errors.WeaveError('Started hook have to be a function.')
        }

        if (options.stopped && typeof options.stopped !== 'function') {
            throw new Errors.WeaveError('Stopped hook have to be a function.')
        }
        return state
    }

module.exports = stateFactory
