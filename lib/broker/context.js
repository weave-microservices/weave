/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const utils = require('../utils')
const makeContext = ({ state, transport, call, emit, options, bus, shouldCollectMetrics, Errors }) =>
    action => {
        // generate context body
        const newContext = {
            id: null,
            state,
            nodeId: state.nodeId || null,
            callerNodeId: null,
            params: null,
            meta: {},
            timeout: 0,
            retryCount: 0,
            level: 0,
            metrics: null,
            action,
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
                return emit(eventName, payload, groups)
            },
            call (actionName, params, options = {}) {
                options.parentContext = this

                if (options.maxCallLevel < this.level) {
                    return Promise.reject(new Errors.WeaveMaxCallLevelError(state.nodeId, this.level))
                }
                return call(actionName, params, options)
            }
        }


        return newContext
    }

module.exports = makeContext
