/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const stateFactory = ({ pkg, createId, Errors }) =>
    options => {
        const broker = Object.create(null)

        broker.options = options
        broker.nodeId = options.nodeId || createId()
        broker.version = pkg.version
        broker.services = []
        broker.middlewares = []
        broker.isStarted = false
        broker.waitForServiceInterval = null
        broker.actionCount = 0

        if (options.started && typeof options.started !== 'function') {
            throw new Errors.WeaveError('Started hook have to be a function.')
        }

        if (options.stopped && typeof options.stopped !== 'function') {
            throw new Errors.WeaveError('Stopped hook have to be a function.')
        }
        return broker
    }

module.exports = stateFactory
