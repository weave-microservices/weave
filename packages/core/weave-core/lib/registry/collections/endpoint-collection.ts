/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

import { Broker } from "@lib/lib/broker/broker"
import { createActionEndpoint, Endpoint } from '../action-endpoint'
import { LoadBalancingStrategy } from '../../constants'
import { Service, ServiceAction } from "../service"
import { Node } from "../node"

export interface EndpointCollection {
  name: string,
  groupName: string,
  isInternal: boolean,
  endpoints: Array<Endpoint>,
  localEndpoints: Array<Endpoint>,
  add(node: Node, service: Service, action: ServiceAction): boolean,
  hasAvailable(): boolean,
  hasLocal(): boolean,
  getNextAvailableEndpoint(): Endpoint,
  getNextLocalEndpoint(): Endpoint,
  count(): number,
  getByNodeId(nodeId: string): Endpoint,
  removeByNodeId(nodeId: string): void,
  removeByService(service: Service): void
}

export function createEndpointList (broker: Broker, name: string, groupName?: string): EndpointCollection {
  const endpointList: EndpointCollection = Object.create(null)
  const options = broker.options
  let counter = 0

  endpointList.endpoints = []
  endpointList.name = name
  endpointList.groupName = groupName
  endpointList.isInternal = name.startsWith('$')
  endpointList.localEndpoints = []

  const setLocalEndpoints = () => {
    endpointList.localEndpoints = endpointList.endpoints.filter(endpoint => endpoint.isLocal)
  }

  /**
   * Select an Entpoint with the selected Load-Balancing-Strategy
   * @param {*} endpointList List of all available Endpoints
   * @returns {any} Endpoint
   */
  const select = (endpointList) => {
    // round robin
    if (options.registry.loadBalancingStrategy === LoadBalancingStrategy.Random) {
      if (counter >= endpointList.length) {
        counter = 0
      }
      const res = endpointList[counter++]
      return res
    } else {
      const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
      return endpointList[randomInt(0, endpointList.length - 1)]

      // todo: implement random load balancer
    }
  }

  endpointList.add = (node: Node, service: Service, action: ServiceAction) => { // todo: addaction
    const foundEndpoint = endpointList.endpoints.find(endpoint => endpoint.node.id === node.id && endpoint.service.name === service.name)

    if (foundEndpoint) {
      foundEndpoint.updateAction(action)
      return false
    }

    const newEndpoint = createActionEndpoint(broker, node, service, action)

    endpointList.endpoints.push(newEndpoint)
    setLocalEndpoints()
    return true
  }

  endpointList.hasAvailable = () => endpointList.endpoints.find(endpoint => endpoint.isAvailable()) != null

  endpointList.hasLocal = () => endpointList.localEndpoints.length > 0

  endpointList.getNextAvailableEndpoint = () => { // todo: rename
    if (endpointList.endpoints.length === 0) {
      return null
    }

    // If there is a local service, get a local endpoint
    if (endpointList.isInternal && endpointList.hasLocal()) {
      return endpointList.getNextLocalEndpoint()
    }

    // If only one endpoint is available return this.
    if (endpointList.endpoints.length === 1) {
      const endpoint = endpointList.endpoints[0]
      if (endpoint.isAvailable()) {
        return endpoint
      }
      return null
    }

    if (options.registry.preferLocalActions && endpointList.hasLocal()) {
      const endpoint = endpointList.getNextLocalEndpoint()
      if (endpoint && endpoint.isAvailable()) {
        return endpoint
      }
    }

    const availableEndpoints = endpointList.endpoints.filter(endpoint => endpoint.isAvailable())
    if (availableEndpoints.length === 0) {
      return null
    }

    return select(availableEndpoints)
  }

  endpointList.getNextLocalEndpoint = () => {
    if (endpointList.localEndpoints.length === 0) {
      return null
    }

    if (endpointList.endpoints.length === 1) {
      const endpoint = endpointList.localEndpoints[0]
      if (endpoint.isAvailable()) {
        return endpoint
      }
      return null
    }

    const availableEndpoints = endpointList.localEndpoints.filter(endpoint => endpoint.isAvailable())
    if (availableEndpoints.length === 0) {
      return null
    }

    return select(availableEndpoints)
  }

  endpointList.count = () => endpointList.endpoints.length

  endpointList.getByNodeId = (nodeId: string) => endpointList.endpoints.find(endpoint => endpoint.node.id === nodeId)

  endpointList.removeByNodeId = (nodeId: string) => {
    const endpointToRemove = endpointList.endpoints.find(item => item.node.id === nodeId)
    endpointList.endpoints.splice(endpointList.endpoints.indexOf(endpointToRemove), 1)
    setLocalEndpoints()
  }

  endpointList.removeByService = (service: Service) => {
    const endpointToRemove = endpointList.endpoints.find(endpoint => endpoint.service === service)
    if (endpointToRemove) {
      endpointList.endpoints.splice(endpointList.endpoints.indexOf(endpointToRemove), 1)
    }
    setLocalEndpoints()
  }

  return endpointList
}
