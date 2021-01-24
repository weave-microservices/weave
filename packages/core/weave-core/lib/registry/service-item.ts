/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
'use strict'

import { Node } from "./node"
import { ServiceSettings } from "./service"

export interface ServiceItem {
  name: string,
  node: Node,
  settings: any,
  version: number,
  actions: any,
  events: any,
  isLocal: boolean,
  addAction(action: any): void,
  addEvent(event: any): void,
  equals(name: string, version: number, nodeId: string): boolean,
  update(service: any): void
}

// todo: find a better name
export function createServiceItem (node: Node, name: string, version: number, settings: ServiceSettings, isLocal: boolean): ServiceItem {
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
