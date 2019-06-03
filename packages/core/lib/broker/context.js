/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
'use strict'

const utils = require('../utils')
const { WeaveMaxCallLevelError } = require('../errors')

const createContext = (broker, endpoint) => {
    const newContext = {
        id: null,
        nodeId: broker.nodeId || null,
        callerNodeId: null,
        params: null,
        meta: {},
        level: 1,
        tracing: null,
        span: null,
        action: endpoint.action,
        endpoint,
        startTime: null,
        startHighResolutionTime: null,
        options: {
            timeout: null,
            retries: null
        },
        duration: 0,
        stopTime: 0,
        setParams (newParams) {
            this.params = newParams || {}
        },
        emit (eventName, payload, groups) {
            return broker.emit(eventName, payload, groups)
        },
        broadcast (eventName, payload, groups) {
            return broker.broadcast(eventName, payload, groups)
        },
        /**
         * Call a action.
         * @param {string} actionName Name of the action.
         * @param {object} params Parameter
         * @param {object} [options={}] Call options
         * @returns {Promise} Promise
         */
        call (actionName, params, options = {}) {
            options.parentContext = this

            if (options.maxCallLevel < this.level) {
                return Promise.reject(new WeaveMaxCallLevelError(broker.nodeId, this.level))
            }

            const p = broker.call(actionName, params, options)
            return p.then(result => {
                if (p.context) {
                    Object.assign(this.meta, p.context.meta)
                }
                return result
            })
        },
        startSpan (name, options) {
            if (this.span) {
                this.span = this.span.startChildSpan(name, options)
            } else {
                this.span = broker.tracer.startSpan(name, options)
            }
            return this.span
        }
    }

    // generate a context Id
    if (!newContext.id) {
        newContext.id = utils.generateToken()
        if (!newContext.requestId) {
            newContext.requestId = newContext.id
        }
    }

    return newContext
}

module.exports = createContext
