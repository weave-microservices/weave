/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */
'use strict'

/**
 * @typedef {import("../types").ServiceItem} ServiceItem
 * @typedef {import("../types").Node} Node
*/

/**
 * Service item factory
 * @param {Node} node Node
 * @param {string} name Service name
 * @param {number} version Service version
 * @param {object} settings version
 * @param {boolean} isLocal Is local node
 * @returns {ServiceItem} Node instance
*/
exports.createServiceItem = (node, name, version, settings, isLocal) => {
  /**
   * @type {ServiceItem}
  */
  const serviceItem = Object.create(null)

  serviceItem.name = name
  serviceItem.node = node
  serviceItem.settings = settings || {}
  serviceItem.version = version
  serviceItem.actions = {}
  serviceItem.events = {}
  serviceItem.isLocal = isLocal

  serviceItem.addAction = (action) => {
    serviceItem.actions[action.name] = action
  }

  serviceItem.addEvent = (event) => {
    serviceItem.events[event.name] = event
  }

  serviceItem.equals = (name, version, nodeId) => {
    return serviceItem.name === name && serviceItem.version === version && (nodeId == null || serviceItem.node.id === nodeId)
  }

  serviceItem.update = (service) => {
    serviceItem.settings = service.settings
    serviceItem.version = service.version
  }

  return serviceItem
}
