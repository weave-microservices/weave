/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
'use strict'

const utils = require('../utils')

const makeContext = ({
    state,
    call,
    emit,
    broadcast,
    Errors
}) =>
    endpoint => {
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
                return emit(eventName, payload, groups)
            },
            broadcast (eventName, payload, groups) {
                return broadcast(eventName, payload, groups)
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
                    return Promise.reject(new Errors.WeaveMaxCallLevelError(state.nodeId, this.level))
                }

                const p = call(actionName, params, options)
                return p.then(result => {
                    if (p.context) {
                        Object.assign(this.meta, p.context.meta)
                    }
                    return result
                })
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

module.exports = makeContext
