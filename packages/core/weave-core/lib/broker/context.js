/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
'use strict'

const { uuid, isFunction } = require('@weave-js/utils')
const { WeaveMaxCallLevelError } = require('../errors')

exports.createContext = (runtime) => {
  const context = {
    id: null,
    nodeId: runtime.nodeId || null,
    callerNodeId: null,
    parentContext: null,
    endpoint: null,
    data: {},
    meta: {},
    level: 1,
    tracing: null,
    span: null,
    service: null,
    startHighResolutionTime: null,
    options: {
      timeout: null,
      retries: null
    },
    duration: 0,
    stopTime: 0,
    setParams (newParams) {
      this.data = newParams || {}
    },
    setEndpoint (endpoint) {
      this.nodeId = endpoint.node.id
      this.endpoint = endpoint
      this.action = endpoint.action
      this.service = endpoint.action.service
    },
    emit (eventName, payload, options = {}) {
      options.parentContext = this
      return runtime.eventBus.emit(eventName, payload, options)
    },
    broadcast (eventName, payload, options = {}) {
      options.parentContext = this
      return runtime.eventBus.broadcast(eventName, payload, options)
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
      if (runtime.options.registry.maxCallLevel > 0 && this.level >= runtime.options.registry.maxCallLevel) {
        return Promise.reject(new WeaveMaxCallLevelError({ nodeId: runtime.nodeId, maxCallLevel: runtime.options.registry.maxCallLevel }))
      }

      const p = runtime.actionInvoker.call(actionName, params, options)

      return p.then(result => {
        if (p.context) {
          this.meta = Object.assign(this.meta, p.context.meta)
        }
        return result
      })
    },
    startSpan (name, options) {
      if (this.span) {
        this.span = this.span.startChildSpan(name, options)
      } else {
        this.span = runtime.tracer.startSpan(name, options)
      }
      return this.span
    },
    finishSpan () {
      if (this.span) {
        this.span.finish()
        return this.span
      }
    },
    copy () {
      const newContext = exports.createContext(runtime)

      newContext.nodeId = this.nodeId
      newContext.options = this.options
      newContext.data = this.data
      newContext.meta = this.meta
      newContext.parentContext = this.parentContext
      newContext.callerNodeId = this.callerNodeId
      newContext.level = this.level
      newContext.options = this.options
      newContext.eventName = this.eventName
      newContext.eventType = this.eventType
      newContext.eventGroups = this.eventGroups

      return newContext
    }
  }

  // generate context Id
  if (!context.id) {
    // Use custom UUID factory
    if (runtime.options.uuidFactory && isFunction(runtime.options.uuidFactory)) {
      context.id = runtime.options.uuidFactory.call(context, runtime)
    } else {
      context.id = uuid()
    }

    // Pass existing request ID
    if (!context.requestId) {
      context.requestId = context.id
    }
  }

  return context
}

