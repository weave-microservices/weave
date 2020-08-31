/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
'use strict'

const { uuid } = require('@weave-js/utils')
// const { deprecatedWarning } = require('../utils/deprecated-warning')
const { WeaveMaxCallLevelError } = require('../errors')

const createContext = (broker) => {
  const newContext = {
    id: null,
    nodeId: broker.nodeId || null,
    callerNodeId: null,
    parentContext: null,
    endpoint: null,
    get params () {
      return this.data
    },
    set params (value) {
      this.data = value
    },
    data: {},
    meta: {},
    level: 1,
    tracing: null,
    span: null,
    service: null,
    // startTime: null,
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
          this.meta = Object.assign(this.meta, p.context.meta)
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
    },
    copy () {
      const newContext = createContext(broker)

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

  // generate a context Id
  if (!newContext.id) {
    newContext.id = uuid()
    if (!newContext.requestId) {
      newContext.requestId = newContext.id
    }
  }

  return newContext
}

module.exports = createContext
