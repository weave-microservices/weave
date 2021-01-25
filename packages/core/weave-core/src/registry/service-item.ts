/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
'use strict'

import { Node } from "../shared/interfaces/node.interface"
import { ServiceItem } from "../shared/interfaces/service-item.interface"
import { ServiceSettings } from "../shared/types/service-settings.type"

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
