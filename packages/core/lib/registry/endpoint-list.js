/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const Endpoint = require('./endpoint')
const { loadBalancingStrategy } = require('../constants')

const EndpointList = (broker, name, groupName) => {
  const self = Object.create(null)
  const options = broker.options
  const list = self.endpoints = []
  let counter = 0
  self.state = broker

  const EndpointFactory = Endpoint

  self.name = name
  self.groupName = groupName
  self.isInternal = name.startsWith('$')
  self.localEndpoints = []

  const setLocalEndpoints = () => {
    self.localEndpoints = list.filter(endpoint => endpoint.isLocal)
  }

  self.add = (node, service, action) => {
    const foundEndpoint = list.find(endpoint => endpoint.node.id === node.id && endpoint.service.name === service.name)

    if (foundEndpoint) {
      foundEndpoint.updateAction(action)
      return false
    }

    const newEndpoint = EndpointFactory(broker, node, service, action)

    list.push(newEndpoint)
    setLocalEndpoints()
    return true
  }

  self.hasAvailable = () => list.find(endpoint => endpoint.isAvailable()) != null

  self.hasLocal = () => self.localEndpoints.length > 0

  self.getNextAvailable = () => {
    if (list.length === 0) {
      return null
    }

    if (self.isInternal && self.hasLocal()) {
      return self.getNextLocalEndpoint()
    }

    // If only one endpoint is available return this.
    if (list.length === 1) {
      const endpoint = list[0]
      if (endpoint.isAvailable()) {
        return endpoint
      }
      return null
    }

    if (options.registry.preferLocalActions && self.hasLocal()) {
      const endpoint = self.getNextLocalEndpoint()
      if (endpoint && endpoint.isAvailable()) {
        return endpoint
      }
    }

    const availableEndpoints = list.filter(endpoint => endpoint.isAvailable())
    if (availableEndpoints.length === 0) {
      return null
    }

    return select(availableEndpoints)
  }

  self.getNextLocalEndpoint = () => {
    if (self.localEndpoints.length === 0) {
      return null
    }

    if (list.length === 1) {
      const endpoint = self.localEndpoints[0]
      if (endpoint.isAvailable()) {
        return endpoint
      }
      return null
    }

    const availableEndpoints = self.localEndpoints.filter(endpoint => endpoint.isAvailable())
    if (availableEndpoints.length === 0) {
      return null
    }

    return select(availableEndpoints)
  }

  self.count = () => list.length

  self.getByNodeId = (nodeId) => list.find(endpoint => endpoint.node.id === nodeId)

  self.removeByNodeId = (nodeId) => {
    const endpointToRemove = list.find(item => item.node.id === nodeId)
    list.splice(list.indexOf(endpointToRemove), 1)
    setLocalEndpoints()
  }

  self.removeByService = service => {
    const endpointToRemove = list.find(endpoint => endpoint.service === service)
    if (endpointToRemove) {
      list.splice(list.indexOf(endpointToRemove), 1)
    }
    setLocalEndpoints()
  }

  return self

  function select (endpointList) {
    // round robin
    if (options.registry.loadBalancingStrategy === loadBalancingStrategy.ROUND_ROBIN) {
      if (counter >= endpointList.length) {
        counter = 0
      }
      return endpointList[counter++]
    } else {
      const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
      return endpointList[randomInt(0, endpointList.length - 1)]

      // todo: implement random load balancer
    }
  }
}

module.exports = EndpointList